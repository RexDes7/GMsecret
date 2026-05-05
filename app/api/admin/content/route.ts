import { NextResponse } from "next/server";
import { contentRepository } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { ContentTypeEnum } from "@/lib/schemas/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/content
 *   ?type=character|map|...
 *   &authorUsername= | &authorId=
 *   &q=
 *   &featured=1
 *   &visibility=public|private
 *   &limit= &offset=
 *
 * Admin-only. Returns ALL records (drafts + public) so moderators can act
 * on anything regardless of visibility.
 */
export async function GET(req: Request) {
  await requireAdmin(req);
  const url = new URL(req.url);
  const typeRaw = url.searchParams.get("type");
  const typeParse = typeRaw ? ContentTypeEnum.safeParse(typeRaw) : null;
  const authorId = url.searchParams.get("authorId") ?? undefined;
  const authorUsername = url.searchParams.get("authorUsername") ?? undefined;
  const search = url.searchParams.get("q") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "100");
  const offset = Number(url.searchParams.get("offset") ?? "0");
  const featured = url.searchParams.get("featured") === "1";
  const visibility = url.searchParams.get("visibility");

  const result = await contentRepository().list({
    type: typeParse?.success ? typeParse.data : undefined,
    authorId,
    authorUsername,
    search: search && search.trim() ? search.trim() : undefined,
    limit: Number.isFinite(limit) ? limit : 100,
    offset: Number.isFinite(offset) ? offset : 0,
    onlyPublic: false,
    featured: featured || undefined,
  });
  let items = result.items;
  if (visibility === "public") items = items.filter((c) => c.isPublic);
  if (visibility === "private") items = items.filter((c) => !c.isPublic);
  return NextResponse.json({ items, total: items.length });
}
