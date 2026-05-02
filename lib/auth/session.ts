import "server-only";
import type { NextRequest } from "next/server";

/**
 * Minimal server-side session resolver.
 *
 * Today we trust three client-sent headers (`x-user-id`, `x-user-name`,
 * `x-user-role`). This is intentionally *not* secure — it's a placeholder
 * so the full data-flow (builder → POST /api/content → file repo → profile
 * page) can be wired up end-to-end before NextAuth is in place.
 *
 * When NextAuth lands, swap this module for a cookie-based session reader:
 * route handlers and guards keep the same contract and carry on working.
 */

export type ServerSession = {
  id: string;
  username: string;
  role: "user" | "admin";
};

export function readSession(req: Request | NextRequest): ServerSession | null {
  const id = req.headers.get("x-user-id");
  const username = req.headers.get("x-user-name");
  const role = req.headers.get("x-user-role");
  if (!id || !username) return null;
  return {
    id,
    username,
    role: role === "admin" ? "admin" : "user",
  };
}

export function requireSession(req: Request | NextRequest): ServerSession {
  const s = readSession(req);
  if (!s) {
    // Route handlers throwing a Response is a legit Next.js 16 pattern —
    // the closest catch boundary surfaces it and the runtime streams the
    // status+body back to the client.
    throw new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return s;
}

export function requireAdmin(req: Request | NextRequest): ServerSession {
  const s = requireSession(req);
  if (s.role !== "admin") {
    throw new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return s;
}
