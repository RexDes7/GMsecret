import { NextResponse } from "next/server";
import { mapAssetRepository } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public list of admin-uploaded map assets. Anyone (including unauthenticated
 * map viewers) can read the catalogue so previews and shared maps render
 * the custom imagery referenced in their `objects[].kind = "custom:<id>"`.
 * Upload and delete go through `/api/admin/map-assets`.
 */
export async function GET() {
  const items = await mapAssetRepository().list();
  return NextResponse.json({ items });
}
