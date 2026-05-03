import "server-only";
import { readJson, updateJson } from "@/lib/db/file-store";
import type {
  IUserRepository,
  UserProfile,
  UserProfilePatch,
} from "@/lib/db/repository";

const FILE = "users";

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
      const idx = list.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        out = {
          ...user,
          displayName: user.username,
          bio: "",
          avatarUrl: "",
          createdAt: now,
          updatedAt: now,
        };
        return [...list, out];
      }
      // Never downgrade a user from admin to user on login; only lift from
      // user to admin via an explicit setter. The `?? existing.role` guards
      // against a client accidentally resetting the server-side role.
      const existing = list[idx]!;
      out = {
        ...existing,
        username: user.username,
        email: user.email,
        role: existing.role === "admin" ? "admin" : user.role,
        updatedAt: now,
      };
      const next = list.slice();
      next[idx] = out;
      return next;
    });
    return out;
  }

  async getById(id: string): Promise<UserProfile | undefined> {
    const list = await readJson<UserProfile[]>(FILE, []);
    return list.find((u) => u.id === id);
  }

  async getByUsername(username: string): Promise<UserProfile | undefined> {
    const list = await readJson<UserProfile[]>(FILE, []);
    return list.find((u) => u.username === username);
  }

  async getByEmail(email: string): Promise<UserProfile | undefined> {
    const needle = email.trim().toLowerCase();
    const list = await readJson<UserProfile[]>(FILE, []);
    return list.find((u) => u.email.toLowerCase() === needle);
  }

  async patch(
    id: string,
    patch: UserProfilePatch
  ): Promise<UserProfile | undefined> {
    const now = new Date().toISOString();
    let out: UserProfile | undefined;
    await updateJson<UserProfile[]>(FILE, [], (list) => {
      const idx = list.findIndex((u) => u.id === id);
      if (idx === -1) return list;
      const merged: UserProfile = {
        ...list[idx]!,
        ...patch,
        updatedAt: now,
      };
      out = merged;
      const next = list.slice();
      next[idx] = merged;
      return next;
    });
    return out;
  }
}
