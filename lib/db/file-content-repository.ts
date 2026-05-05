import "server-only";
import {
  ContentInputSchema,
  ContentRecordSchema,
  type ContentInput,
  type ContentRecord,
} from "@/lib/schemas/content";
import { readJson, updateJson } from "@/lib/db/file-store";
import type {
  IContentRepository,
  ListOptions,
  ListResult,
} from "@/lib/db/repository";

const FILE = "content";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function all(): Promise<ContentRecord[]> {
  const raw = await readJson<ContentRecord[]>(FILE, []);
  // Defensive re-parse — if an older shape is on disk we'd rather swallow
  // unknowns than crash every request.
  return raw
    .map((r) => {
      const p = ContentRecordSchema.safeParse(r);
      return p.success ? p.data : undefined;
    })
    .filter((r): r is ContentRecord => Boolean(r));
}

export class FileContentRepository implements IContentRepository {
  async create(
    input: ContentInput,
    authorId: string,
    authorUsername: string
  ): Promise<ContentRecord> {
    const parsed = ContentInputSchema.parse(input);
    const now = new Date().toISOString();
    const record = ContentRecordSchema.parse({
      ...parsed,
      id: uid(),
      authorId,
      authorUsername,
      createdAt: now,
      updatedAt: now,
      views: 0,
      featured: false,
    });
    await updateJson<ContentRecord[]>(FILE, [], (list) => [...list, record]);
    return record;
  }

  async get(id: string): Promise<ContentRecord | undefined> {
    const list = await all();
    return list.find((c) => c.id === id);
  }

  async list(opts?: ListOptions): Promise<ListResult> {
    // No hard cap on the page size — server-side callers (admin moderation,
    // analytics, cascade delete) need to be able to enumerate the full
    // collection. Public clients should pass their own limit. Default page
    // size stays small (20) to keep anonymous fetches cheap.
    const limit = Math.max(1, opts?.limit ?? 20);
    const offset = Math.max(0, opts?.offset ?? 0);
    let arr = await all();
    if (opts?.type) arr = arr.filter((c) => c.type === opts.type);
    if (opts?.authorId) arr = arr.filter((c) => c.authorId === opts.authorId);
    if (opts?.authorUsername) {
      arr = arr.filter((c) => c.authorUsername === opts.authorUsername);
    }
    if (opts?.onlyPublic) arr = arr.filter((c) => c.isPublic);
    if (opts?.featured) arr = arr.filter((c) => c.featured);
    if (opts?.search) {
      const q = opts.search.toLowerCase();
      arr = arr.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return { items: arr.slice(offset, offset + limit), total: arr.length };
  }

  async update(
    id: string,
    patch: Partial<ContentInput>,
    actor: { id: string; role: "user" | "admin" }
  ): Promise<ContentRecord | undefined> {
    let updated: ContentRecord | undefined;
    await updateJson<ContentRecord[]>(FILE, [], (list) => {
      const idx = list.findIndex((c) => c.id === id);
      if (idx === -1) return list;
      const existing = list[idx]!;
      if (existing.authorId !== actor.id && actor.role !== "admin") {
        throw new Error("forbidden");
      }
      const merged = {
        ...existing,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      updated = ContentRecordSchema.parse(merged);
      const next = list.slice();
      next[idx] = updated;
      return next;
    });
    return updated;
  }

  async delete(
    id: string,
    actor: { id: string; role: "user" | "admin" }
  ): Promise<boolean> {
    let deleted = false;
    await updateJson<ContentRecord[]>(FILE, [], (list) => {
      const idx = list.findIndex((c) => c.id === id);
      if (idx === -1) return list;
      const existing = list[idx]!;
      if (existing.authorId !== actor.id && actor.role !== "admin") {
        throw new Error("forbidden");
      }
      deleted = true;
      return list.filter((c) => c.id !== id);
    });
    return deleted;
  }
}
