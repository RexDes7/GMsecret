import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { mapAssetRepository } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function DELETE(req: Request, { params }: { params: Params }) {
  await requireAdmin(req);
  const { id } = await params;
  const existing = await mapAssetRepository().get(id);
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  // Drop the metadata first, then attempt to remove the file. If the file
  // is missing on disk (e.g. someone removed it manually) we still succeed.
  await mapAssetRepository().delete(id);
  if (existing.fileUrl.startsWith("/uploads/map-assets/")) {
    const filePath = path.join(process.cwd(), "public", existing.fileUrl);
    try {
      await fs.unlink(filePath);
    } catch {
      /* ignore — file already gone */
    }
  }
  return NextResponse.json({ ok: true });
}
