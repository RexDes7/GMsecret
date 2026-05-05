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
  banned: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
};

export type UserProfilePatch = Partial<
  Pick<UserProfile, "displayName" | "bio" | "avatarUrl">
>;

export type UserListOptions = {
  search?: string;
  role?: "user" | "admin";
  banned?: boolean;
  limit?: number;
  offset?: number;
};

export type UserListResult = {
  items: UserProfile[];
  total: number;
};

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

  // ── admin operations
  list(opts?: UserListOptions): Promise<UserListResult>;
  setRole(
    id: string,
    role: "user" | "admin"
  ): Promise<UserProfile | undefined>;
  setBanned(
    id: string,
    banned: boolean
  ): Promise<UserProfile | undefined>;
  delete(id: string): Promise<boolean>;
  touchLastSeen(id: string): Promise<void>;
}

// ────────────────────────────────────────── Map assets (admin upload)

/**
 * A custom map asset uploaded by an admin (PNG/JPG/SVG). The `kind` used in
 * `MapObject.kind` for these assets is `custom:<id>`. The renderer fetches
 * `fileUrl` lazily on first paint and caches the rasterised image, the same
 * way it does for built-in inline-SVG assets.
 */
export type MapAsset = {
  id: string;
  slug: string;
  nameRu: string;
  category: "nature" | "furniture" | "structure" | "decor" | "custom";
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  createdBy: string;
};

export type MapAssetInput = Omit<MapAsset, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

export interface IMapAssetRepository {
  list(): Promise<MapAsset[]>;
  get(id: string): Promise<MapAsset | undefined>;
  create(input: MapAssetInput): Promise<MapAsset>;
  delete(id: string): Promise<boolean>;
}
