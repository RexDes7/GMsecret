import { NextResponse } from "next/server";
import { z } from "zod";
import type { ContentInput } from "@/lib/schemas/content";
import { contentRepository } from "@/lib/db";
import { readSession, requireSession } from "@/lib/auth/session";

// Partial-patch schema. We avoid `.partial()` on `ContentInputSchema` because
// that's a ZodIntersection (union of types + shared fields) and Zod doesn't
// define a meaningful partial there. This accepts any subset of the
// top-level fields and delegates the real validation to the full
// `ContentRecordSchema.parse(merged)` call inside the repository.
const ContentPatchSchema = z
  .object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(2000).optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string().max(40)).max(16).optional(),
    featured: z.boolean().optional(),
    data: z.unknown().optional(),
  })
  .passthrough();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const record = await contentRepository().get(id);
  if (!record) return NextResponse.json({ error: "not_found" }, { status: 404 });
  // Drafts only visible to the author (or admin).
  if (!record.isPublic) {
    const s = readSession(req);
    if (!s || (s.id !== record.authorId && s.role !== "admin")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
  }
  return NextResponse.json(record);
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const session = requireSession(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = ContentPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  try {
    const updated = await contentRepository().update(
      id,
      parsed.data as Partial<ContentInput>,
      session
    );
    if (!updated)
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    if ((e as Error).message === "forbidden")
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    throw e;
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const session = requireSession(req);
  try {
    const ok = await contentRepository().delete(id, session);
    if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as Error).message === "forbidden")
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    throw e;
  }
}
