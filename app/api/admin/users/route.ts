import { NextResponse } from "next/server";
import { userRepository } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { stripHash } from "@/lib/db/safe-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  requireAdmin(req);
  const url = new URL(req.url);
  const search = url.searchParams.get("q") ?? undefined;
  const role = url.searchParams.get("role");
  const banned = url.searchParams.get("banned");
  const limit = Number(url.searchParams.get("limit") ?? "200");
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const result = await userRepository().list({
    search: search?.trim() || undefined,
    role: role === "user" || role === "admin" ? role : undefined,
    banned:
      banned === "1" || banned === "true"
        ? true
        : banned === "0" || banned === "false"
          ? false
          : undefined,
    limit: Number.isFinite(limit) ? limit : 200,
    offset: Number.isFinite(offset) ? offset : 0,
  });
  return NextResponse.json({
    items: result.items.map(stripHash),
    total: result.total,
  });
}
