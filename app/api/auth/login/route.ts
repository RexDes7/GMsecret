import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { userRepository } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

/**
 * POST /api/auth/login
 *
 * Verifies the email + password against the persisted bcrypt hash, then
 * returns the canonical session payload. The client stores this in its
 * `useAuth` provider (localStorage) and the existing `x-user-*` header
 * scheme keeps working downstream — this endpoint is the gate that
 * actually decides whether a session is created.
 *
 * Legacy accounts created before passwords existed (no `passwordHash`)
 * cannot log in via this route — the user must reset/seed a password.
 * Right now there's no self-service reset, but admin can call
 * `setPasswordHash` directly from a script if needed.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const profile = await userRepository().getByEmail(parsed.data.email);
  // Use a constant-time comparison even for "user not found" so we don't
  // leak whether an email is registered. bcrypt.compare against an empty
  // hash always returns false but takes a similar amount of time.
  const hash = profile?.passwordHash ?? "";
  let ok = false;
  if (hash) {
    try {
      ok = await bcrypt.compare(parsed.data.password, hash);
    } catch {
      ok = false;
    }
  } else {
    // Run a dummy compare to keep timing similar.
    try {
      await bcrypt.compare(parsed.data.password, "$2a$10$" + "x".repeat(53));
    } catch {
      /* ignore */
    }
  }
  if (!profile || !ok) {
    return NextResponse.json(
      { error: "invalid_credentials" },
      { status: 401 }
    );
  }
  if (profile.banned) {
    return NextResponse.json(
      { error: "banned", message: "Аккаунт заблокирован" },
      { status: 403 }
    );
  }
  // Don't return the hash to the client.
  const { passwordHash: _hash, ...safe } = profile;
  void _hash;
  return NextResponse.json(safe);
}
