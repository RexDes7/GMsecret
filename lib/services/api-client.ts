"use client";

import type { SessionUser } from "@/components/providers/auth-provider";

/**
 * Thin client for our API routes. Automatically attaches the current user's
 * identity as request headers — the server-side `readSession` helper
 * consumes them in `lib/auth/session.ts`. When we move to NextAuth, this
 * module is trivially adapted: headers disappear, cookies take over, and
 * the call sites don't change.
 */

function headersFor(user: SessionUser | null | undefined): HeadersInit {
  const h: Record<string, string> = {
    "content-type": "application/json",
  };
  if (user) {
    h["x-user-id"] = user.id;
    h["x-user-name"] = user.username;
    h["x-user-role"] = user.role;
  }
  return h;
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    user?: SessionUser | null;
    body?: unknown;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const res = await fetch(path, {
    method: opts.method ?? "GET",
    headers: headersFor(opts.user ?? null),
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Request failed with ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* ignore non-json error bodies */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
