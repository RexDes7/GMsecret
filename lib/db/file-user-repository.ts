import "server-only";
import { readJson, updateJson } from "@/lib/db/file-store";
import type {
  IUserRepository,
  UserListOptions,
  UserListResult,
  UserProfile,
  UserProfilePatch,
} from "@/lib/db/repository";

const FILE = "users";

/** Hydrates older records on disk that predate `banned`/`lastSeenAt`. */
function hydrate(raw: Partial<UserProfile> & { id: string }): UserProfile {
  return {
    id: raw.id,
    username: raw.username ?? raw.id,
    email: raw.email ?? "",
    displayName: raw.displayName ?? raw.username ?? raw.id,
    bio: raw.bio ?? "",
    avatarUrl: raw.avatarUrl ?? "",
    role: raw.role === "admin" ? "admin" : "user",
    banned: Boolean(raw.banned ?? false),
    passwordHash: raw.passwordHash,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
    lastSeenAt:
      raw.lastSeenAt ?? raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
  };
}

async function readAll(): Promise<UserProfile[]> {
  const raw = await readJson<Array<Partial<UserProfile> & { id: string }>>(
    FILE,
    []
  );
  return raw.map(hydrate);
}

export class FileUserRepository implements IUserRepository {
  async upsert(user: {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
  }): Promise<UserProfile> {
    const now = new Date().toISOString();
    let out!: UserProfile;
    await updateJson<UserProfile[]>(FILE, [], (list) => {
      const hydrated = list.map((u) => hydrate(u));
      const idx = hydrated.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        out = {
          ...user,
          displayName: user.username,
          bio: "",
          avatarUrl: "",
          banned: false,
          createdAt: now,
          updatedAt: now,
          lastSeenAt: now,
        };
        return [...hydrated, out];
      }
      // Never downgrade a user from admin to user on login; only lift from
      // user to admin via an explicit setter. The `?? existing.role` guards
      // against a client accidentally resetting the server-side role.
      const existing = hydrated[idx]!;
      out = {
        ...existing,
        username: user.username,
        email: user.email,
        role: existing.role === "admin" ? "admin" : user.role,
        updatedAt: now,
        lastSeenAt: now,
      };
      const next = hydrated.slice();
      next[idx] = out;
      return next;
    });
    return out;
  }

  async getById(id: string): Promise<UserProfile | undefined> {
    const list = await readAll();
    return list.find((u) => u.id === id);
  }

  async getByUsername(username: string): Promise<UserProfile | undefined> {
    const list = await readAll();
    return list.find((u) => u.username === username);
  }

  async getByEmail(email: string): Promise<UserProfile | undefined> {
    const needle = email.trim().toLowerCase();
    const list = await readAll();
    return list.find((u) => u.email.toLowerCase() === needle);
  }

  async patch(
    id: string,
    patch: UserProfilePatch
  ): Promise<UserProfile | undefined> {
    const now = new Date().toISOString();
    let out: UserProfile | undefined;
    await updateJson<UserProfile[]>(FILE, [], (list) => {
      const hydrated = list.map((u) => hydrate(u));
      const idx = hydrated.findIndex((u) => u.id === id);
      if (idx === -1) return hydrated;
      const merged: UserProfile = {
        ...hydrated[idx]!,
        ...patch,
        updatedAt: now,
      };
      out = merged;
      const next = hydrated.slice();
      next[idx] = merged;
      return next;
    });
    return out;
  }

  async list(opts: UserListOptions = {}): Promise<UserListResult> {
    let arr = await readAll();
    if (opts.role) arr = arr.filter((u) => u.role === opts.role);
    if (opts.banned !== undefined) {
      arr = arr.filter((u) => u.banned === opts.banned);
    }
    if (opts.search) {
      const q = opts.search.toLowerCase();
      arr = arr.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }
    arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const total = arr.length;
    // No hard cap — server-side analytics needs to enumerate every user.
    // Default page size stays small for accidental client calls.
    const limit = Math.max(1, opts.limit ?? 100);
    const offset = Math.max(0, opts.offset ?? 0);
    return { items: arr.slice(offset, offset + limit), total };
  }

  async setRole(
    id: string,
    role: "user" | "admin"
  ): Promise<UserProfile | undefined> {
    const now = new Date().toISOString();
    let out: UserProfile | undefined;
    await updateJson<UserProfile[]>(FILE, [], (list) => {
      const hydrated = list.map((u) => hydrate(u));
      const idx = hydrated.findIndex((u) => u.id === id);
      if (idx === -1) return hydrated;
      out = { ...hydrated[idx]!, role, updatedAt: now };
      const next = hydrated.slice();
      next[idx] = out;
      return next;
    });
    return out;
  }

  async setBanned(
    id: string,
    banned: boolean
  ): Promise<UserProfile | undefined> {
    const now = new Date().toISOString();
    let out: UserProfile | undefined;
    await updateJson<UserProfile[]>(FILE, [], (list) => {
      const hydrated = list.map((u) => hydrate(u));
      const idx = hydrated.findIndex((u) => u.id === id);
      if (idx === -1) return hydrated;
      out = { ...hydrated[idx]!, banned, updatedAt: now };
      const next = hydrated.slice();
      next[idx] = out;
      return next;
    });
    return out;
  }

  async delete(id: string): Promise<boolean> {
    let removed = false;
    await updateJson<UserProfile[]>(FILE, [], (list) => {
      const hydrated = list.map((u) => hydrate(u));
      const before = hydrated.length;
      const next = hydrated.filter((u) => u.id !== id);
      removed = next.length < before;
      return next;
    });
    return removed;
  }

  async touchLastSeen(id: string): Promise<void> {
    const now = new Date().toISOString();
    await updateJson<UserProfile[]>(FILE, [], (list) => {
      const hydrated = list.map((u) => hydrate(u));
      const idx = hydrated.findIndex((u) => u.id === id);
      if (idx === -1) return hydrated;
      const next = hydrated.slice();
      next[idx] = { ...hydrated[idx]!, lastSeenAt: now };
      return next;
    });
  }

  async createIfUnique(input: {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
    passwordHash: string;
  }): Promise<
    | { ok: true; profile: UserProfile }
    | { ok: false; conflict: "email" | "username" }
  > {
    const now = new Date().toISOString();
    const emailLower = input.email.toLowerCase();
    let result:
      | { ok: true; profile: UserProfile }
      | { ok: false; conflict: "email" | "username" }
      | null = null;
    await updateJson<UserProfile[]>(FILE, [], (list) => {
      const hydrated = list.map((u) => hydrate(u));
      // Check inside the locked transaction so concurrent registers can't
      // both observe "no such user" and then both insert.
      if (
        hydrated.some(
          (u) =>
            u.id === input.id || u.username.toLowerCase() === input.username.toLowerCase()
        )
      ) {
        result = { ok: false, conflict: "username" };
        return hydrated;
      }
      if (hydrated.some((u) => u.email.toLowerCase() === emailLower)) {
        result = { ok: false, conflict: "email" };
        return hydrated;
      }
      const created: UserProfile = {
        id: input.id,
        username: input.username,
        email: input.email,
        displayName: input.username,
        bio: "",
        avatarUrl: "",
        role: input.role,
        banned: false,
        passwordHash: input.passwordHash,
        createdAt: now,
        updatedAt: now,
        lastSeenAt: now,
      };
      result = { ok: true, profile: created };
      return [...hydrated, created];
    });
    return result!;
  }

  async setPasswordHash(
    id: string,
    hash: string
  ): Promise<UserProfile | undefined> {
    const now = new Date().toISOString();
    let out: UserProfile | undefined;
    await updateJson<UserProfile[]>(FILE, [], (list) => {
      const hydrated = list.map((u) => hydrate(u));
      const idx = hydrated.findIndex((u) => u.id === id);
      if (idx === -1) return hydrated;
      out = { ...hydrated[idx]!, passwordHash: hash, updatedAt: now };
      const next = hydrated.slice();
      next[idx] = out;
      return next;
    });
    return out;
  }
}

