import { NextResponse } from "next/server";
import { userRepository } from "@/lib/db";
import { stripPublicSensitive } from "@/lib/db/safe-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = Promise<{ username: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { username } = await params;
  const profile = await userRepository().getByUsername(username);
  if (!profile) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  // Strip both the email and the bcrypt hash before responding — anyone can
  // hit this endpoint, so anything sensitive must be removed centrally
  // through `stripPublicSensitive`.
  return NextResponse.json(stripPublicSensitive(profile));
}
