import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { mapFontRepository } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin(req);
  const { id } = await params;
  const existing = await mapFontRepository().get(id);
  if (!existing) {
    return NextResponse.json({ ok: true });
  }
  // Best-effort filesystem cleanup. The metadata is the source of truth.
  if (existing.fileUrl.startsWith("/uploads/map-fonts/")) {
    const filename = existing.fileUrl.split("/").pop();
    if (filename) {
      try {
        await fs.unlink(
          path.join(process.cwd(), "public", "uploads", "map-fonts", filename)
        );
      } catch {
        /* ignore — already gone */
      }
    }
  }
  await mapFontRepository().delete(id);
  return NextResponse.json({ ok: true });
}
