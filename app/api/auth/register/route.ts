import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { userRepository } from "@/lib/db";
import { stripHash } from "@/lib/db/safe-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9-]+$/i, "username_format"),
  password: z.string().min(8).max(200),
});

/**
 * POST /api/auth/register
 *
 * Creates a new account with a bcrypt-hashed password. Email and username
 * must both be unique — the uniqueness check and the insert run in a
 * single locked transaction (`createIfUnique`) so two concurrent
 * registrations can't both succeed and clobber each other.
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
  const emailLower = parsed.data.email.toLowerCase();
  const username = parsed.data.username.toLowerCase();
  const hash = await bcrypt.hash(parsed.data.password, 10);
  const result = await userRepository().createIfUnique({
    id: username,
    username,
    email: emailLower,
    role: "user",
    passwordHash: hash,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.conflict === "email" ? "email_taken" : "username_taken" },
      { status: 409 }
    );
  }
  return NextResponse.json(stripHash(result.profile));
}
