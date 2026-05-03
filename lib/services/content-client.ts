"use client";

import type {
  ContentInput,
  ContentRecord,
  ContentType,
} from "@/lib/schemas/content";
import type { SessionUser } from "@/components/providers/auth-provider";
import { apiFetch } from "@/lib/services/api-client";

export type ListArgs = {
  type?: ContentType;
  authorId?: string;
  authorUsername?: string;
  onlyPublic?: boolean;
  featured?: boolean;
  q?: string;
  limit?: number;
  offset?: number;
};

function toQuery(args: ListArgs | undefined): string {
  if (!args) return "";
  const sp = new URLSearchParams();
  if (args.type) sp.set("type", args.type);
  if (args.authorId) sp.set("authorId", args.authorId);
  if (args.authorUsername) sp.set("authorUsername", args.authorUsername);
  if (args.onlyPublic) sp.set("onlyPublic", "1");
  if (args.featured) sp.set("featured", "1");
  if (args.q) sp.set("q", args.q);
  if (args.limit !== undefined) sp.set("limit", String(args.limit));
  if (args.offset !== undefined) sp.set("offset", String(args.offset));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const ContentClient = {
  async list(
    args?: ListArgs,
    user?: SessionUser | null
  ): Promise<{ items: ContentRecord[]; total: number }> {
    return apiFetch(`/api/content${toQuery(args)}`, { user });
  },

  async get(
    id: string,
    user?: SessionUser | null
  ): Promise<ContentRecord> {
    return apiFetch<ContentRecord>(
      `/api/content/${encodeURIComponent(id)}`,
      { user }
    );
  },

  async create(
    input: ContentInput,
    user: SessionUser
  ): Promise<ContentRecord> {
    return apiFetch<ContentRecord>("/api/content", {
      method: "POST",
      user,
      body: input,
    });
  },

  async update(
    id: string,
    patch: Partial<ContentInput>,
    user: SessionUser
  ): Promise<ContentRecord> {
    return apiFetch<ContentRecord>(`/api/content/${encodeURIComponent(id)}`, {
      method: "PATCH",
      user,
      body: patch,
    });
  },

  async remove(id: string, user: SessionUser): Promise<void> {
    await apiFetch(`/api/content/${encodeURIComponent(id)}`, {
      method: "DELETE",
      user,
    });
  },
};
