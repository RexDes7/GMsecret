import { NextResponse } from "next/server";
import { z } from "zod";
import { contentRepository, userRepository } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  banned: z.boolean().optional(),
});

type Params = Promise<{ id: string }>;

export async function PATCH(req: Request, { params }: { params: Params }) {
  const session = requireAdmin(req);
  const { id } = await params;
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
  // Prevent an admin from accidentally locking themselves out: can't ban or
  // demote yourself via this endpoint.
  if (id === session.id) {
    if (parsed.data.role === "user" || parsed.data.banned === true) {
      return NextResponse.json(
        { error: "self_lockout_blocked" },
        { status: 400 }
      );
    }
  }

  let next = await userRepository().getById(id);
  if (!next) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (parsed.data.role && parsed.data.role !== next.role) {
    next = await userRepository().setRole(id, parsed.data.role);
  }
  if (
    parsed.data.banned !== undefined &&
    parsed.data.banned !== next?.banned
  ) {
    next = await userRepository().setBanned(id, parsed.data.banned);
  }

  return NextResponse.json(next ?? null);
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  const session = requireAdmin(req);
  const { id } = await params;
  if (id === session.id) {
    return NextResponse.json(
      { error: "self_lockout_blocked" },
      { status: 400 }
    );
  }
  // Cascade: delete all content this user authored so the file repo doesn't
  // leak orphans pointing at a missing author.
  const owned = await contentRepository().list({
    authorId: id,
    limit: 500,
    onlyPublic: false,
  });
  for (const record of owned.items) {
    try {
      await contentRepository().delete(record.id, session);
    } catch {
      /* ignore */
    }
  }
  const ok = await userRepository().delete(id);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, deletedContent: owned.items.length });
}
