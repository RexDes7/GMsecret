/**
 * Some ttg.club endpoints (notably /api/v1/classes and /api/v1/bestiary)
 * return 403 even from real browser sessions, but their public Nuxt pages
 * are server-rendered with the same data inlined as the `__NUXT_DATA__`
 * payload. We extract that payload, decode it via `devalue`, and pull the
 * relevant slice out.
 *
 * As with the v2 endpoints, results are cached on disk under
 * `.data/ttg-cache/<resource>/...` so we make at most one upstream call per
 * cache window per server.
 */
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { parse as devalueParse } from "devalue";

const ROOT = path.join(process.cwd(), ".data", "ttg-cache");
const TTG = "https://new.ttg.club";

const LIST_TTL_MS = 24 * 60 * 60 * 1000;
const DETAIL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const HTML_HEADERS: HeadersInit = {
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  accept: "text/html",
  "accept-language": "ru,en;q=0.9",
};

// Nuxt 3 emits Vue/Pinia internal tokens (ShallowReactive, Ref, …) into the
// payload. We don't care about reactivity on the server, so we strip them.
const REVIVERS: Record<string, (v: unknown) => unknown> = {
  ShallowReactive: (v) => v,
  Reactive: (v) => v,
  Ref: (v) => v,
  ShallowRef: (v) => v,
  EmptyShallowRef: () => null,
  EmptyRef: () => null,
  EmptyShallowReactive: () => ({}),
  EmptyReactive: () => ({}),
};

const NUXT_DATA_RE =
  /<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/;

async function readCache<T>(file: string, ttlMs: number): Promise<T | null> {
  try {
    const stat = await fs.stat(file);
    if (Date.now() - stat.mtimeMs > ttlMs) return null;
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

async function readStale<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

async function writeCache(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data), "utf8");
}

async function fetchNuxtPayload(url: string): Promise<Record<string, unknown>> {
  const r = await fetch(url, { headers: HTML_HEADERS, cache: "no-store" });
  if (!r.ok) throw new Error(`upstream ${url} ${r.status}`);
  const html = await r.text();
  const m = html.match(NUXT_DATA_RE);
  if (!m) throw new Error(`no __NUXT_DATA__ in ${url}`);
  const raw = m[1] ?? "";
  const decoded = devalueParse(raw, REVIVERS) as Record<string, unknown>;
  return decoded;
}

// ───────────────────────────────────────────── Classes

export type TtgClassListItem = {
  url: string;
  name: { rus: string; eng?: string };
  image?: string;
  hasSubclasses?: boolean;
  source?: { name?: { label?: string; rus?: string }; page?: number };
};

export async function getClassList(): Promise<TtgClassListItem[]> {
  const file = path.join(ROOT, "classes", "list.json");
  const cached = await readCache<TtgClassListItem[]>(file, LIST_TTL_MS);
  if (cached) return cached;
  try {
    const payload = await fetchNuxtPayload(`${TTG}/classes`);
    const data = (payload["data"] ?? {}) as Record<string, unknown>;
    const items = (data["classes"] as TtgClassListItem[] | undefined) ?? [];
    await writeCache(file, items);
    return items;
  } catch (e) {
    const stale = await readStale<TtgClassListItem[]>(file);
    if (stale) return stale;
    throw e;
  }
}

export type TtgClassFeature = {
  isSubclass?: boolean;
  key?: string;
  level?: number;
  name?: string;
  optionsName?: string | null;
  description?: unknown[];
};

export type TtgClassDetail = {
  url: string;
  name: { rus: string; eng?: string };
  description?: unknown[];
  gallery?: string[];
  hitDice?: { label?: string; value?: string; maxValue?: number; avg?: number };
  primaryCharacteristics?: string;
  proficiency?: unknown;
  equipment?: unknown[];
  savingThrows?: string;
  features?: TtgClassFeature[];
  table?: unknown;
  casterType?: unknown;
  hasSubclasses?: boolean;
  image?: string;
  source?: { name?: { rus?: string; label?: string }; page?: number };
};

export type TtgSubclassListItem = {
  url: string;
  name: { rus: string; eng?: string };
  image?: string;
  source?: { name?: { rus?: string; label?: string }; page?: number };
};

export async function getClassDetail(
  slug: string
): Promise<{
  detail: TtgClassDetail | null;
  subclasses: TtgSubclassListItem[];
} | null> {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeSlug) return null;
  const file = path.join(ROOT, "classes", "detail", `${safeSlug}.json`);
  const cached = await readCache<{
    detail: TtgClassDetail | null;
    subclasses: TtgSubclassListItem[];
  }>(file, DETAIL_TTL_MS);
  if (cached) return cached;
  try {
    const payload = await fetchNuxtPayload(`${TTG}/classes/${safeSlug}`);
    const data = (payload["data"] ?? {}) as Record<string, unknown>;
    const detailKey = `classes-${safeSlug}`;
    const subKey = `class-${safeSlug}-subclasses`;
    const detail = (data[detailKey] as TtgClassDetail | undefined) ?? null;
    const subclassesRaw = (data[subKey] as TtgSubclassListItem[] | undefined) ?? [];
    const subclasses = Array.isArray(subclassesRaw) ? subclassesRaw : [];
    if (!detail) return null;
    const result = { detail, subclasses };
    await writeCache(file, result);
    return result;
  } catch (e) {
    const stale = await readStale<{
      detail: TtgClassDetail | null;
      subclasses: TtgSubclassListItem[];
    }>(file);
    if (stale) return stale;
    throw e;
  }
}

// ───────────────────────────────────────────── Bestiary (paginated SSR)

export type TtgBestiaryListItem = {
  url: string;
  name: { rus: string; eng?: string };
  challengeRailing?: string; // sic. — that's how upstream spells it.
  type?: string;
  source?: { name?: { rus?: string; label?: string }; page?: number };
};

/**
 * The SSR /bestiary page only ships the first 60 items — getting the full
 * 700+ list would require multiple requests with `?page=N`. As a starting
 * point we return whatever is on the first page; the per-creature detail
 * pages still work via getCreatureDetail. Pagination can be added later.
 */
export async function getBestiaryFirstPage(): Promise<{
  items: TtgBestiaryListItem[];
  count: number;
}> {
  const file = path.join(ROOT, "bestiary", "page-0.json");
  const cached = await readCache<{
    items: TtgBestiaryListItem[];
    count: number;
  }>(file, LIST_TTL_MS);
  if (cached) return cached;
  try {
    const payload = await fetchNuxtPayload(`${TTG}/bestiary`);
    const data = (payload["data"] ?? {}) as Record<string, unknown>;
    const sp = data["bestiary-search-page"] as
      | { value?: TtgBestiaryListItem[]; Count?: number }
      | undefined;
    const result = {
      items: (sp?.value ?? []) as TtgBestiaryListItem[],
      count: sp?.Count ?? sp?.value?.length ?? 0,
    };
    await writeCache(file, result);
    return result;
  } catch (e) {
    const stale = await readStale<{
      items: TtgBestiaryListItem[];
      count: number;
    }>(file);
    if (stale) return stale;
    throw e;
  }
}

export type TtgCreatureDetail = Record<string, unknown> & {
  url: string;
  name: { rus: string; eng?: string };
};

export async function getCreatureDetail(
  slug: string
): Promise<TtgCreatureDetail | null> {
  const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!safeSlug) return null;
  const file = path.join(ROOT, "bestiary", "detail", `${safeSlug}.json`);
  const cached = await readCache<TtgCreatureDetail>(file, DETAIL_TTL_MS);
  if (cached) return cached;
  try {
    const payload = await fetchNuxtPayload(`${TTG}/bestiary/${safeSlug}`);
    const data = (payload["data"] ?? {}) as Record<string, unknown>;
    // The bestiary detail data key naming follows `creature-<slug>` or
    // similar; pick the first object that has `name.rus` to be defensive.
    let creature: TtgCreatureDetail | null = null;
    for (const v of Object.values(data)) {
      if (
        v &&
        typeof v === "object" &&
        "name" in v &&
        typeof (v as { name?: unknown }).name === "object"
      ) {
        creature = v as TtgCreatureDetail;
        break;
      }
    }
    if (!creature) return null;
    await writeCache(file, creature);
    return creature;
  } catch (e) {
    const stale = await readStale<TtgCreatureDetail>(file);
    if (stale) return stale;
    throw e;
  }
}
