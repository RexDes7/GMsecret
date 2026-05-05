import { NextResponse } from "next/server";
import { z } from "zod";
import { contentRepository } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { ContentInput } from "@/lib/schemas/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AdminPatchSchema = z.object({
  isPublic: z.boolean().optional(),
  featured: z.boolean().optional(),
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().max(40)).max(16).optional(),
});

type Params = Promise<{ id: string }>;

export async function PATCH(req: Request, { params }: { params: Params }) {
  const session = await requireAdmin(req);
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = AdminPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  // The shared `update` repo method accepts a `Partial<ContentInput>` and
  // merges it on top of the existing record. `featured` is a record-level
  // field (not part of `ContentInput`) but gets through the spread merge
  // and the resulting record is re-parsed by `ContentRecordSchema`, so it
  // ends up persisted correctly. Clearer than introducing a second method
  // on the repo for now.
  const updated = await contentRepository().update(
    id,
    parsed.data as Partial<ContentInput>,
    session
  );
  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const session = await requireAdmin(req);
  const { id } = await params;
  const ok = await contentRepository().delete(id, session);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
