import "server-only";
import type {
  IContentRepository,
  IMapAssetRepository,
  IMapFontRepository,
  IUserRepository,
} from "@/lib/db/repository";
import { FileContentRepository } from "@/lib/db/file-content-repository";
import { FileUserRepository } from "@/lib/db/file-user-repository";
import { FileMapAssetRepository } from "@/lib/db/file-map-asset-repository";
import { FileMapFontRepository } from "@/lib/db/file-map-font-repository";

/**
 * Repository factory. Today the only implementation is the file-backed dev
 * store. To migrate to MongoDB:
 *
 *   1. Implement `MongoContentRepository` / `MongoUserRepository` against the
 *      same interfaces in `./repository.ts`.
 *   2. Swap the two lines below to check `process.env.DB_DRIVER === "mongo"`
 *      and return the Mongo variants, falling back to File for dev.
 *   3. No route handler or client-side code needs to change.
 */

let _content: IContentRepository | undefined;
let _users: IUserRepository | undefined;
let _mapAssets: IMapAssetRepository | undefined;
let _mapFonts: IMapFontRepository | undefined;

export function contentRepository(): IContentRepository {
  _content ??= new FileContentRepository();
  return _content;
}

export function userRepository(): IUserRepository {
  _users ??= new FileUserRepository();
  return _users;
}

export function mapAssetRepository(): IMapAssetRepository {
  _mapAssets ??= new FileMapAssetRepository();
  return _mapAssets;
}

export function mapFontRepository(): IMapFontRepository {
  _mapFonts ??= new FileMapFontRepository();
  return _mapFonts;
}
