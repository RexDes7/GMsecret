"use client";

/**
 * Custom-font registry for map text annotations. Admins upload TTF/OTF/
 * WOFF/WOFF2 files via `/admin/map-fonts`; the public listing at
 * `/api/map-fonts` is fetched by `MapFontClient.list()` which calls
 * `registerCustomMapFonts` here. We then load each font once via the
 * `FontFace` API and attach it to `document.fonts` so canvas drawing and
 * any DOM previews share the same typefaces.
 *
 * Built-in families (`serif`, `sans-serif`, `monospace`) are always
 * available and don't need registration.
 */

const registered = new Set<string>();
const loaded = new Set<string>();
const inflight = new Map<string, Promise<void>>();
const fontWaiters = new Set<() => void>();

const slugToFamily = new Map<string, string>();

export type RegisterableFont = {
  slug: string;
  fileUrl: string;
  mimeType?: string;
};

/**
 * Built-in font families exposed to the editor's font picker. The renderer
 * passes whatever string is in `MapText.fontFamily` to the canvas; for
 * non-custom values the canvas falls back to system serif/sans/mono.
 */
export const BUILTIN_FONT_FAMILIES: ReadonlyArray<{
  value: string;
  label: string;
  cssFamily: string;
}> = [
  { value: "serif", label: "Шрифт с засечками", cssFamily: "serif" },
  { value: "sans-serif", label: "Без засечек", cssFamily: "sans-serif" },
  { value: "monospace", label: "Моноширинный", cssFamily: "monospace" },
];

/**
 * Resolve `MapText.fontFamily` (which may be `custom:<slug>` or a built-in
 * value) to a CSS font-family value usable by `ctx.font`.
 */
export function resolveFontFamily(value: string): string {
  if (value.startsWith("custom:")) {
    const slug = value.slice("custom:".length);
    return slugToFamily.get(slug) ?? slug;
  }
  return value;
}

export function isFontReady(value: string): boolean {
  if (!value.startsWith("custom:")) return true;
  const slug = value.slice("custom:".length);
  return loaded.has(slug);
}

export function subscribeFontLoaded(cb: () => void): () => void {
  fontWaiters.add(cb);
  return () => fontWaiters.delete(cb);
}

function notifyFontLoaded() {
  for (const cb of fontWaiters) cb();
}

function format(mimeType: string | undefined, url: string): string {
  if (mimeType?.includes("woff2")) return "woff2";
  if (mimeType?.includes("woff")) return "woff";
  if (mimeType?.includes("opentype") || url.endsWith(".otf")) return "opentype";
  return "truetype";
}

async function loadOne(font: RegisterableFont): Promise<void> {
  if (loaded.has(font.slug)) return;
  const family = `gmsh-${font.slug}`;
  slugToFamily.set(font.slug, family);
  if (typeof document === "undefined" || typeof FontFace === "undefined") {
    return;
  }
  try {
    const face = new FontFace(
      family,
      `url("${font.fileUrl}") format("${format(font.mimeType, font.fileUrl)}")`
    );
    const ready = await face.load();
    document.fonts.add(ready);
    loaded.add(font.slug);
    notifyFontLoaded();
  } catch {
    // Swallow — bad font shouldn't crash the editor. The text just falls
    // back to the slug literal which the browser resolves to a default.
  }
}

export function registerCustomMapFonts(fonts: RegisterableFont[]): void {
  for (const f of fonts) {
    if (registered.has(f.slug)) continue;
    registered.add(f.slug);
    if (!inflight.has(f.slug)) {
      inflight.set(f.slug, loadOne(f));
    }
  }
}

export function clearCustomMapFonts(): void {
  registered.clear();
  loaded.clear();
  inflight.clear();
  slugToFamily.clear();
}
