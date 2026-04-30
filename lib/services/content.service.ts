import {
  ContentInputSchema,
  ContentRecordSchema,
  type ContentInput,
  type ContentRecord,
  type ContentType,
} from "@/lib/schemas/content";

/**
 * Content service. The current implementation uses an in-memory store so that
 * UI work can proceed before MongoDB / Mongoose are wired up. Swap this with
 * a Mongoose-backed implementation once the database is provisioned.
 */

const store = new Map<string, ContentRecord>();

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export class ContentService {
  static create(
    input: ContentInput,
    authorId: string,
    authorUsername: string
  ): ContentRecord {
    const parsed = ContentInputSchema.parse(input);
    const now = new Date().toISOString();
    const record: ContentRecord = ContentRecordSchema.parse({
      ...parsed,
      id: uid(),
      authorId,
      authorUsername,
      createdAt: now,
      updatedAt: now,
      views: 0,
      featured: false,
    });
    store.set(record.id, record);
    return record;
  }

  static get(id: string): ContentRecord | undefined {
    return store.get(id);
  }

  static list(opts?: {
    type?: ContentType;
    authorId?: string;
    limit?: number;
    offset?: number;
    search?: string;
    onlyPublic?: boolean;
  }): { items: ContentRecord[]; total: number } {
    const limit = Math.min(100, Math.max(1, opts?.limit ?? 20));
    const offset = Math.max(0, opts?.offset ?? 0);
    let arr = Array.from(store.values());
    if (opts?.type) arr = arr.filter((c) => c.type === opts.type);
    if (opts?.authorId) arr = arr.filter((c) => c.authorId === opts.authorId);
    if (opts?.onlyPublic) arr = arr.filter((c) => c.isPublic);
    if (opts?.search) {
      const q = opts.search.toLowerCase();
      arr = arr.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return { items: arr.slice(offset, offset + limit), total: arr.length };
  }

  static update(
    id: string,
    patch: Partial<ContentInput>,
    actorId: string
  ): ContentRecord | undefined {
    const existing = store.get(id);
    if (!existing) return undefined;
    if (existing.authorId !== actorId) {
      throw new Error("forbidden");
    }
    const merged = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    const record = ContentRecordSchema.parse(merged);
    store.set(id, record);
    return record;
  }

  static delete(id: string, actorId: string): boolean {
    const existing = store.get(id);
    if (!existing) return false;
    if (existing.authorId !== actorId) {
      throw new Error("forbidden");
    }
    return store.delete(id);
  }
}
