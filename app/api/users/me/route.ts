import { NextResponse } from "next/server";
import { z } from "zod";
import { userRepository } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { stripHash } from "@/lib/db/safe-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/users/me — returns the authenticated user's canonical profile
 * (role, banned status, displayName, …). Used by the AuthProvider on
 * mount and tab focus to reconcile the cached client session with the
 * server's source of truth.
 *
 * SECURITY: this endpoint MUST NOT auto-create a profile from the client
 * session headers. With password auth in place the only legitimate way
 * to mint a profile is via `/api/auth/register`, which is the endpoint
 * that decides the initial role. If we hit this endpoint with a session
 * id that has no matching profile, the session is forged or stale and
 * we return 401 so the client signs out — the previous behaviour
 * (upsert with `role: session.role`) was a privilege-escalation vector
 * because `session.role` came from the spoofable `x-user-role` header.
 */
export async function GET(req: Request) {
  const session = requireSession(req);
  const existing = await userRepository().getById(session.id);
  if (!existing) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  return NextResponse.json(stripHash(existing));
}

const PatchSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

/**
 * PATCH /api/users/me — edit own profile. Username/email/role/banned are
 * immutable here. Username is the public identifier; email/role/banned
 * are managed server-side and via the admin endpoints.
 */
export async function PATCH(req: Request) {
  const session = requireSession(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const updated = await userRepository().patch(session.id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(stripHash(updated));
}
