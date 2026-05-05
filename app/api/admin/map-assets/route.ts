import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod";
import { mapAssetRepository } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "map-assets");
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const META_SCHEMA = z.object({
  nameRu: z.string().min(1).max(80),
  category: z.enum(["nature", "furniture", "structure", "decor", "custom"]),
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

function extFor(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

export async function GET(req: Request) {
  await requireAdmin(req);
  const items = await mapAssetRepository().list();
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
    category: form.get("category"),
    slug: form.get("slug"),
  });
  if (!meta.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: meta.error.issues },
      { status: 400 }
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "missing_file" },
      { status: 400 }
    );
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: "unsupported_type", mime: file.type },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "file_too_large", maxBytes: MAX_BYTES, size: file.size },
      { status: 413 }
    );
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const id = uid();
  const ext = extFor(file.type);
  const filename = `${id}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buf);
  const fileUrl = `/uploads/map-assets/${filename}`;
  const record = await mapAssetRepository().create({
    id,
    slug: meta.data.slug,
    nameRu: meta.data.nameRu,
    category: meta.data.category,
    fileUrl,
    mimeType: file.type,
    sizeBytes: file.size,
    createdBy: session.id,
  });
  return NextResponse.json(record, { status: 201 });
}
