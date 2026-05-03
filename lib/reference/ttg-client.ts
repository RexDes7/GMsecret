/**
 * Server-side fetcher + on-disk cache for the ttg.club D&D reference data
 * (spells, magic-items, feats, backgrounds, species). All calls happen from
 * the Next.js server (never the client) so the upstream rate-limit is shared
 * across users instead of multiplied by them.
 *
 * Cache layout:
 *   .data/ttg-cache/<resource>/list.json
 *   .data/ttg-cache/<resource>/detail/<slug>.json
 *
 * The cache is gitignored (.data is dev-only persistence — see file-store.ts)
 * and serves as a stale-while-revalidate buffer: a list is considered fresh
 * for LIST_TTL_MS, a detail for DETAIL_TTL_MS. Upstream failures fall back
 * to whatever cache exists.
 */
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), ".data", "ttg-cache");
const TTG = "https://new.ttg.club";

const LIST_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const DETAIL_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7d

const COMMON_HEADERS: HeadersInit = {
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  accept: "application/json, text/plain, */*",
  "accept-language": "ru,en;q=0.9",
  origin: TTG,
  referer: `${TTG}/`,
};

export type TtgResource =
  | "spells"
  | "magic-items"
  | "feats"
  | "backgrounds"
  | "species";

// ───────────────────────────────────────────── Schemas (loose; see ttg api)

export type TtgName = { rus: string; eng?: string };
export type TtgSourceRef = {
  name?: { label?: string; rus?: string; eng?: string };
  group?: { label?: string; rus?: string };
  page?: number;
};

export type TtgSpellListItem = {
  url: string;
  name: TtgName;
  level: number;
  school: string;
  concentration: boolean;
  ritual: boolean;
  components: { v?: boolean; s?: boolean; m?: boolean | string | null };
  source: TtgSourceRef;
};

export type TtgSpellDetail = TtgSpellListItem & {
  castingTime: string;
  range: string;
  duration: string;
  description?: string[];
  upper?: string[];
  affiliation?: {
    classes?: { url: string; name: string }[];
    subclasses?: { url: string; name: string }[];
    species?: { url: string; name: string }[];
    feats?: { url: string; name: string }[];
  };
};

export type TtgMagicItemListItem = {
  url: string;
  name: TtgName;
  rarity: string;
  attunement: boolean;
  source: TtgSourceRef;
};

export type TtgFeatListItem = {
  url: string;
  name: TtgName;
  category: string;
  source: TtgSourceRef;
};

export type TtgBackgroundListItem = {
  url: string;
  name: TtgName;
  abilityScores?: string;
  source: TtgSourceRef;
};

export type TtgSpeciesListItem = {
  url: string;
  name: TtgName;
  hasLineages?: boolean;
  image?: string;
  source: TtgSourceRef;
};

// Generic detail — preserve the upstream shape; the renderer is loose.
export type TtgDetail = Record<string, unknown> & {
  url: string;
  name: TtgName;
  description?: unknown;
};

// ───────────────────────────────────────────── Cache helpers

async function readCache<T>(file: string, ttlMs: number): Promise<T | null> {
  try {
    const stat = await fs.stat(file);
    if (Date.now() - stat.mtimeMs > ttlMs) return null;
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function readStale<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeCache(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data), "utf8");
}

// ───────────────────────────────────────────── Public API

export async function getList<T = unknown>(
  resource: TtgResource
): Promise<T[]> {
  const file = path.join(ROOT, resource, "list.json");
  const cached = await readCache<T[]>(file, LIST_TTL_MS);
  if (cached) return cached;
  try {
    const r = await fetch(
      `${TTG}/api/v2/${resource}/search?size=9999`,
      {
        headers: COMMON_HEADERS,
        // server-side cache is our concern; don't double-cache in next
        cache: "no-store",
      }
    );
    if (!r.ok) throw new Error(`upstream ${resource} list ${r.status}`);
    const data = (await r.json()) as T[];
    await writeCache(file, data);
    return data;
  } catch (e) {
    // Fall back to whatever stale data we have, if any.
    const stale = await readStale<T[]>(file);
    if (stale) return stale;
    throw e;
  }
}

export async function getDetail<T = TtgDetail>(
  resource: TtgResource,
  slug: string
): Promise<T | null> {
  // Defensive: slug should already be safe but normalise anyway.
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeSlug) return null;
  const file = path.join(ROOT, resource, "detail", `${safeSlug}.json`);
  const cached = await readCache<T>(file, DETAIL_TTL_MS);
  if (cached) return cached;
  try {
    const r = await fetch(`${TTG}/api/v2/${resource}/${safeSlug}`, {
      headers: COMMON_HEADERS,
      cache: "no-store",
    });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`upstream ${resource}/${safeSlug} ${r.status}`);
    const data = (await r.json()) as T;
    await writeCache(file, data);
    return data;
  } catch (e) {
    const stale = await readStale<T>(file);
    if (stale) return stale;
    throw e;
  }
}

// Re-export markup helpers for convenience.
export { stripTtgMarkup, excerpt, flattenToText } from "./ttg-rich";
