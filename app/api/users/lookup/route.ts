import { NextResponse } from "next/server";
import { userRepository } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/users/lookup?email=…
 *
 * Returns the canonical id/username/role for an email so the (mock) login
 * flow can recover the user's stable identity instead of deriving a fresh
 * one from the email's local part. Without this, registering as
 * `johndoe` (email `john@example.com`) and then logging back in would
 * produce a brand-new user `john` and orphan the original's content.
 *
 * Only non-sensitive fields are exposed (no email, bio, avatar) so this
 * doubles as a minimal user-existence probe — adequate for our local mock
 * auth, and easy to remove when a real auth provider takes over.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }
  const user = await userRepository().getByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({
    id: user.id,
    username: user.username,
    role: user.role,
  });
}
