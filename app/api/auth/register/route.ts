import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { userRepository } from "@/lib/db";

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
 * must both be unique. Returns the freshly-created profile (sans hash).
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
  const repo = userRepository();
  const [byEmail, byUsername] = await Promise.all([
    repo.getByEmail(emailLower),
    repo.getByUsername(username),
  ]);
  if (byEmail) {
    return NextResponse.json(
      { error: "email_taken" },
      { status: 409 }
    );
  }
  if (byUsername) {
    return NextResponse.json(
      { error: "username_taken" },
      { status: 409 }
    );
  }
  const hash = await bcrypt.hash(parsed.data.password, 10);
  const created = await repo.upsert({
    id: username,
    username,
    email: emailLower,
    role: "user",
  });
  await repo.setPasswordHash(created.id, hash);
  const fresh = await repo.getById(created.id);
  if (!fresh) {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
  const { passwordHash: _hash, ...safe } = fresh;
  void _hash;
  return NextResponse.json(safe);
}
