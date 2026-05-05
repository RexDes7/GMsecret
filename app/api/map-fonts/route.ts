import { NextResponse } from "next/server";
import { mapFontRepository } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public list of admin-uploaded map fonts. Anyone (including unauthenticated
 * map viewers) can read the catalogue so map text annotations referencing
 * `custom:<slug>` fonts render with the correct typeface.
 */
export async function GET() {
  const items = await mapFontRepository().list();
  return NextResponse.json({ items });
}
