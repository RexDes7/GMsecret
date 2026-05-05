import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ArtifactData,
  CharacterData,
  CreatureData,
  ItemData,
  MapData,
  SpellData,
  type ContentInput,
  type ContentType,
} from "@/lib/schemas/content";
import { contentRepository } from "@/lib/db";
import { readSession, requireSession } from "@/lib/auth/session";

const DATA_SCHEMA_BY_TYPE: Record<ContentType, z.ZodTypeAny> = {
  character: CharacterData,
  map: MapData,
  item: ItemData,
  spell: SpellData,
  artifact: ArtifactData,
  creature: CreatureData,
};

// Partial-patch schema. We avoid `.partial()` on `ContentInputSchema` because
// that's a ZodIntersection (union of types + shared fields) and Zod doesn't
// define a meaningful partial there. This accepts any subset of the
// top-level fields and delegates the real validation to the full
// `ContentRecordSchema.parse(merged)` call inside the repository.
// IMPORTANT: Do NOT add `.passthrough()`. The default `strip` mode drops
// unknown keys so an authenticated author can't sneak fields like
// `authorId`, `id`, `views`, or `createdAt` through `{ ...existing, ...patch }`
// in the repository and overwrite protected record fields.
const ContentPatchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string().max(40)).max(16).optional(),
  // `featured` is intentionally NOT part of this schema — it's an admin-only
  // promotion handled via a separate endpoint. A user can't pin their own
  // record to the landing page.
  data: z.unknown().optional(),
});

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
  // When the patch carries a `data` payload, validate it eagerly against
  // the existing record's `type` so the client gets a focused error
  // (e.g. "missing field abilityScores.str") instead of a deep
  // discriminated-union error from inside the repository.
  if (parsed.data.data !== undefined) {
    const existing = await contentRepository().get(id);
    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const dataSchema = DATA_SCHEMA_BY_TYPE[existing.type];
    const dataParse = dataSchema.safeParse(parsed.data.data);
    if (!dataParse.success) {
      return NextResponse.json(
        {
          error: "invalid_input",
          field: "data",
          contentType: existing.type,
          issues: dataParse.error.issues,
        },
        { status: 400 }
      );
    }
    parsed.data.data = dataParse.data;
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
    // The repository runs the full ContentRecordSchema.parse() against the
    // merged record, which can throw a ZodError when, e.g., a client sends
    // item-shaped `data` for a character record. Surface that as 400.
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "invalid_input", issues: e.issues },
        { status: 400 }
      );
    }
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
