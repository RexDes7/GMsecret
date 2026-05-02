import { NextResponse } from "next/server";
import { userRepository } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = Promise<{ username: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { username } = await params;
  const profile = await userRepository().getByUsername(username);
  if (!profile) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  // Trim fields that shouldn't leak to anonymous visitors. Email is removed
  // here; username/displayName/bio/avatarUrl are public by design.
  const { email: _email, ...publicProfile } = profile;
  void _email;
  return NextResponse.json(publicProfile);
}
