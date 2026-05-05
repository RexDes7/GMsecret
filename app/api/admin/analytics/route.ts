import { NextResponse } from "next/server";
import { contentRepository, userRepository } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import type { ContentRecord, ContentType } from "@/lib/schemas/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  await requireAdmin(req);
  const [contentResult, userResult] = await Promise.all([
    contentRepository().list({ limit: 1_000_000, onlyPublic: false }),
    userRepository().list({ limit: 1_000_000 }),
  ]);
  const content = contentResult.items;
  const users = userResult.items;
  const now = Date.now();

  const contentByType: Record<ContentType, number> = {
    character: 0,
    map: 0,
    item: 0,
    spell: 0,
    artifact: 0,
    creature: 0,
  };
  let publicCount = 0;
  let featuredCount = 0;
  for (const c of content) {
    contentByType[c.type] = (contentByType[c.type] ?? 0) + 1;
    if (c.isPublic) publicCount += 1;
    if (c.featured) featuredCount += 1;
  }

  const activeUsers7d = users.filter(
    (u) => now - new Date(u.lastSeenAt).getTime() < 7 * DAY_MS
  ).length;
  const activeUsers30d = users.filter(
    (u) => now - new Date(u.lastSeenAt).getTime() < 30 * DAY_MS
  ).length;
  const newUsers30d = users.filter(
    (u) => now - new Date(u.createdAt).getTime() < 30 * DAY_MS
  ).length;
  const bannedUsers = users.filter((u) => u.banned).length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  // Day-by-day buckets for the last 30 days for sparkline charts.
  function buckets30(items: { createdAt: string }[]) {
    const out = new Array(30).fill(0);
    for (const it of items) {
      const d = new Date(it.createdAt).getTime();
      const ago = Math.floor((now - d) / DAY_MS);
      if (ago >= 0 && ago < 30) out[29 - ago] += 1;
    }
    return out;
  }

  const recentContent = content
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 12)
    .map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      authorUsername: c.authorUsername,
      isPublic: c.isPublic,
      featured: c.featured,
      createdAt: c.createdAt,
    }));

  const topByViews = content
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map((c: ContentRecord) => ({
      id: c.id,
      title: c.title,
      type: c.type,
      authorUsername: c.authorUsername,
      views: c.views,
    }));

  const recentUsers = users
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 10)
    .map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      banned: u.banned,
      createdAt: u.createdAt,
      lastSeenAt: u.lastSeenAt,
    }));

  return NextResponse.json({
    totals: {
      users: users.length,
      content: content.length,
      publicContent: publicCount,
      featuredContent: featuredCount,
      activeUsers7d,
      activeUsers30d,
      newUsers30d,
      bannedUsers,
      adminUsers,
    },
    contentByType,
    series: {
      contentLast30d: buckets30(content),
      signupsLast30d: buckets30(users),
    },
    recentContent,
    topByViews,
    recentUsers,
  });
}
