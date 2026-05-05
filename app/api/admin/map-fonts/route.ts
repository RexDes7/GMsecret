import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod";
import { mapFontRepository } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "map-fonts");
const MAX_BYTES = 4 * 1024 * 1024;
// font/* MIME types vary across browsers (some send application/font-* or
// application/octet-stream for OTF). We accept by MIME *and* by file
// extension as a fallback.
const ALLOWED_MIME = new Set([
  "font/ttf",
  "font/otf",
  "font/woff",
  "font/woff2",
  "application/font-ttf",
  "application/font-otf",
  "application/font-woff",
  "application/font-woff2",
  "application/x-font-ttf",
  "application/x-font-otf",
  "application/octet-stream",
]);
const ALLOWED_EXT = new Set(["ttf", "otf", "woff", "woff2"]);

const META_SCHEMA = z.object({
  nameRu: z.string().min(1).max(80),
  // slug becomes the CSS font-family name registered via FontFace API,
  // so keep it simple — letters, digits, dashes only.
  slug: z
    .string()
    .min(1)
    .max(60)
    .regex(/^[a-z0-9][a-z0-9-]*$/i, "латиница, цифры и дефис"),
});

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function extFromName(name: string): string {
  const lastDot = name.lastIndexOf(".");
  if (lastDot < 0) return "";
  return name.slice(lastDot + 1).toLowerCase();
}

export async function GET(req: Request) {
  await requireAdmin(req);
  const items = await mapFontRepository().list();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await requireAdmin(req);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }
  const file = form.get("file");
  const meta = META_SCHEMA.safeParse({
    nameRu: form.get("nameRu"),
    slug: form.get("slug"),
  });
  if (!meta.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: meta.error.issues },
      { status: 400 }
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  const ext = extFromName(file.name);
  if (!ALLOWED_EXT.has(ext) && !ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "unsupported_type", mime: file.type, ext },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "file_too_large", maxBytes: MAX_BYTES, size: file.size },
      { status: 413 }
    );
  }
  // Slug must be unique because it doubles as the CSS font-family name.
  const existing = await mapFontRepository().getBySlug(meta.data.slug);
  if (existing) {
    return NextResponse.json({ error: "slug_taken" }, { status: 409 });
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const id = uid();
  const finalExt = ALLOWED_EXT.has(ext) ? ext : "ttf";
  const filename = `${id}.${finalExt}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buf);
  const created = await mapFontRepository().create({
    slug: meta.data.slug,
    nameRu: meta.data.nameRu,
    fileUrl: `/uploads/map-fonts/${filename}`,
    mimeType: file.type || `font/${finalExt}`,
    sizeBytes: file.size,
    createdBy: session.id,
  });
  return NextResponse.json(created, { status: 201 });
}
