import "server-only";
import type { NextRequest } from "next/server";
import { userRepository } from "@/lib/db";

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

/**
 * Async guard: rejects requests from banned accounts. Use this in any
 * mutating route the user might still try to call after being banned. Read
 * paths can stay synchronous since `requireSession` is enough — we don't
 * try to suppress public reads behind a ban.
 */
export async function assertNotBanned(session: ServerSession): Promise<void> {
  // Always look the user up server-side — `session.role` comes from a
  // client-sent header in the placeholder auth model, so a banned user
  // could spoof `x-user-role: admin` and bypass the ban otherwise. The
  // admin-exemption applies only to roles persisted in the DB.
  const profile = await userRepository().getById(session.id);
  if (!profile) return;
  if (profile.role === "admin") return;
  if (profile.banned) {
    throw new Response(
      JSON.stringify({ error: "banned", message: "Аккаунт заблокирован" }),
      {
        status: 403,
        headers: { "content-type": "application/json" },
      }
    );
  }
}
