import { NextResponse } from "next/server";
import { z } from "zod";
import { userRepository } from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { stripHash } from "@/lib/db/safe-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpsertSchema = z.object({
  email: z.string().email(),
});

/**
 * GET /api/users/me — returns the authenticated user's profile, bootstrapping
 * one if this is the first request after sign-up.
 */
export async function GET(req: Request) {
  const session = requireSession(req);
  const existing = await userRepository().getById(session.id);
  if (existing) return NextResponse.json(stripHash(existing));
  // Auto-create with a placeholder email when the client hasn't told us one
  // via POST yet. The register flow normally hits POST first.
  const created = await userRepository().upsert({
    id: session.id,
    username: session.username,
    email: `${session.username}@local.invalid`,
    role: session.role,
  });
  return NextResponse.json(stripHash(created));
}

/**
 * POST /api/users/me — called once after sign-up to materialise the profile
 * with the email captured at registration. Idempotent.
 */
export async function POST(req: Request) {
  const session = requireSession(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = UpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const profile = await userRepository().upsert({
    id: session.id,
    username: session.username,
    email: parsed.data.email,
    role: session.role,
  });
  return NextResponse.json(stripHash(profile));
}

const PatchSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  bio: z.string().max(2000).optional(),
  avatarUrl: z
    .union([z.string().url(), z.literal("")])
    .optional(),
});

/**
 * PATCH /api/users/me — edit own profile. Username/email/role are immutable
 * here (username is the public identifier; email/role change flows will be
 * handled by a dedicated admin endpoint later).
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
