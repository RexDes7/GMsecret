import { NextResponse } from "next/server";
import { ContentInputSchema, ContentTypeEnum } from "@/lib/schemas/content";
import { contentRepository } from "@/lib/db";
import { readSession, requireSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/content
 *   ?type=character|map|item|spell|artifact|creature
 *   &authorId= | &authorUsername=
 *   &onlyPublic=1
 *   &featured=1
 *   &q=search
 *   &limit= &offset=
 *
 * Anonymous callers only see `onlyPublic=1` records. A matching author (or
 * an admin) can also see their own drafts.
 */
export async function GET(req: Request) {
  const session = readSession(req);
  const url = new URL(req.url);
  const typeRaw = url.searchParams.get("type");
  const typeParse = typeRaw ? ContentTypeEnum.safeParse(typeRaw) : null;
  const authorId = url.searchParams.get("authorId") ?? undefined;
  const authorUsername =
    url.searchParams.get("authorUsername") ?? undefined;
  const search = url.searchParams.get("q") ?? undefined;
  const limit = Number(url.searchParams.get("limit") ?? "50");
  const offset = Number(url.searchParams.get("offset") ?? "0");
  const featured = url.searchParams.get("featured") === "1";

  // If the caller isn't the author (and not admin), force public-only.
  const ownerView =
    !!session &&
    ((authorId && session.id === authorId) ||
      (authorUsername && session.username === authorUsername) ||
      session.role === "admin");
  const onlyPublic = ownerView
    ? url.searchParams.get("onlyPublic") === "1"
    : true;

  const result = await contentRepository().list({
    type: typeParse?.success ? typeParse.data : undefined,
    authorId,
    authorUsername,
    search: search && search.trim() ? search.trim() : undefined,
    limit: Number.isFinite(limit) ? limit : 50,
    offset: Number.isFinite(offset) ? offset : 0,
    onlyPublic,
    featured: featured || undefined,
  });
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = requireSession(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = ContentInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const record = await contentRepository().create(
    parsed.data,
    session.id,
    session.username
  );
  return NextResponse.json(record, { status: 201 });
}
