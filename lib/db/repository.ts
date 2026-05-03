/**
 * Storage-agnostic repository contracts.
 *
 * The app talks to these interfaces only — never directly to a storage
 * backend. Today we ship a file-backed implementation (`FileContentRepository`,
 * `FileUserRepository`) that persists JSON under `.data/`. When we swap to
 * MongoDB we only add new implementations (`MongoContentRepository`,
 * `MongoUserRepository`) and flip the factory in `./index.ts`; route handlers
 * and client callers stay unchanged.
 *
 * All methods are async to mirror the future network-backed behaviour.
 */
import type {
  ContentInput,
  ContentRecord,
  ContentType,
} from "@/lib/schemas/content";

export type ListOptions = {
  type?: ContentType;
  authorId?: string;
  authorUsername?: string;
  limit?: number;
  offset?: number;
  search?: string;
  onlyPublic?: boolean;
  featured?: boolean;
};

export type ListResult = {
  items: ContentRecord[];
  total: number;
};

export interface IContentRepository {
  create(
    input: ContentInput,
    authorId: string,
    authorUsername: string
  ): Promise<ContentRecord>;

  get(id: string): Promise<ContentRecord | undefined>;

  list(opts?: ListOptions): Promise<ListResult>;

  update(
    id: string,
    patch: Partial<ContentInput>,
    actor: { id: string; role: "user" | "admin" }
  ): Promise<ContentRecord | undefined>;

  delete(
    id: string,
    actor: { id: string; role: "user" | "admin" }
  ): Promise<boolean>;
}

// ────────────────────────────────────────── User profiles

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
};

export type UserProfilePatch = Partial<
  Pick<UserProfile, "displayName" | "bio" | "avatarUrl">
>;

export interface IUserRepository {
  upsert(user: {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
  }): Promise<UserProfile>;

  getById(id: string): Promise<UserProfile | undefined>;

  getByUsername(username: string): Promise<UserProfile | undefined>;

  getByEmail(email: string): Promise<UserProfile | undefined>;

  patch(id: string, patch: UserProfilePatch): Promise<UserProfile | undefined>;
}
