"use client";

/**
 * Map renderer. One module shared by the editor canvas and the read-only
 * detail-view canvas so what you build is exactly what other people see.
 *
 * - `paintTerrain` fills a single cell with a procedural texture. Heavier
 *   tiles (grass, water, stone, …) draw small details so the map doesn't
 *   look like a flat colour grid.
 * - `loadAssetImage` rasterises an inline-SVG asset to an HTMLImageElement,
 *   memoised per kind/cellSize so repeated brush strokes stay smooth.
 * - `drawMap` is the high-level entry point — call it whenever the data,
 *   cell size, or grid visibility changes.
 */

import type { MapDataT, MapTerrain } from "@/lib/schemas/content";
import { MAP_ASSET_BY_KIND } from "./asset-catalog";

export type DrawOptions = {
  showGrid?: boolean;
  showMarkers?: boolean;
};

const TERRAIN_BASE: Record<MapTerrain, string> = {
  floor: "#3a3a3a",
  wall: "#0d0d0d",
  door: "#a16207",
  water: "#143966",
  lava: "#5b1a0c",
  grass: "#1f5d2c",
  stone: "#4a4a4a",
  void: "#050505",
};

function hashCell(x: number, y: number): number {
  // Deterministic hash so the same cell paints the same texture every render.
  let h = (x * 73856093) ^ (y * 19349663);
  h = (h << 13) ^ h;
  h = h * (h * h * 15731 + 789221) + 1376312589;
  return ((h & 0x7fffffff) / 0x7fffffff) | 0 || (h & 0x7fffffff) / 0x7fffffff;
}

function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 100000) / 100000;
  };
}

function paintTerrain(
  ctx: CanvasRenderingContext2D,
  terrain: MapTerrain,
  x: number,
  y: number,
  cell: number
) {
  const px = x * cell;
  const py = y * cell;
  ctx.fillStyle = TERRAIN_BASE[terrain];
  ctx.fillRect(px, py, cell, cell);

  // Cheap deterministic per-cell rng so detail dots don't visibly shift on
  // re-render but neighbour cells aren't all identical.
  const r = rng((x * 73856093) ^ (y * 19349663) ^ terrain.charCodeAt(0));

  switch (terrain) {
    case "grass": {
      // Tufts: short green strokes scattered across the cell.
      ctx.strokeStyle = "#3a8a3a";
      ctx.lineWidth = Math.max(1, cell / 16);
      const tufts = Math.max(3, Math.round(cell / 6));
      for (let i = 0; i < tufts; i++) {
        const tx = px + r() * cell;
        const ty = py + r() * cell;
        const len = cell * (0.18 + r() * 0.18);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + (r() - 0.5) * 4, ty - len);
        ctx.stroke();
      }
      ctx.strokeStyle = "#4ea84e";
      for (let i = 0; i < tufts / 2; i++) {
        const tx = px + r() * cell;
        const ty = py + r() * cell;
        const len = cell * (0.12 + r() * 0.12);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + (r() - 0.5) * 3, ty - len);
        ctx.stroke();
      }
      break;
    }
    case "water": {
      // Wavy darker bands plus a few crests.
      const grad = ctx.createLinearGradient(px, py, px, py + cell);
      grad.addColorStop(0, "#1a4a86");
      grad.addColorStop(1, "#0d2c5a");
      ctx.fillStyle = grad;
      ctx.fillRect(px, py, cell, cell);
      ctx.strokeStyle = "rgba(180, 220, 255, 0.55)";
      ctx.lineWidth = Math.max(1, cell / 18);
      const lines = Math.max(2, Math.round(cell / 8));
      for (let i = 0; i < lines; i++) {
        const ty = py + ((i + 0.5) * cell) / lines + (r() - 0.5) * 2;
        ctx.beginPath();
        ctx.moveTo(px + 1, ty);
        ctx.bezierCurveTo(
          px + cell * 0.3,
          ty - cell * 0.08,
          px + cell * 0.7,
          ty + cell * 0.08,
          px + cell - 1,
          ty
        );
        ctx.stroke();
      }
      break;
    }
    case "stone": {
      // Cracks: a few darker line segments per cell.
      ctx.strokeStyle = "#2c2c2c";
      ctx.lineWidth = Math.max(1, cell / 18);
      const cracks = Math.max(2, Math.round(cell / 12));
      for (let i = 0; i < cracks; i++) {
        const sx = px + r() * cell;
        const sy = py + r() * cell;
        const ex = sx + (r() - 0.5) * cell * 0.6;
        const ey = sy + (r() - 0.5) * cell * 0.6;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      // A few flecks for variation.
      ctx.fillStyle = "rgba(220,220,220,0.12)";
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(px + r() * cell, py + r() * cell, 1.2, 1.2);
      }
      break;
    }
    case "lava": {
      const grad = ctx.createRadialGradient(
        px + cell / 2,
        py + cell / 2,
        cell * 0.05,
        px + cell / 2,
        py + cell / 2,
        cell * 0.7
      );
      grad.addColorStop(0, "#ffe24a");
      grad.addColorStop(0.4, "#ff6b1a");
      grad.addColorStop(1, "#5b1a0c");
      ctx.fillStyle = grad;
      ctx.fillRect(px, py, cell, cell);
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      ctx.lineWidth = Math.max(1, cell / 22);
      const cracks = Math.max(2, Math.round(cell / 10));
      for (let i = 0; i < cracks; i++) {
        ctx.beginPath();
        ctx.moveTo(px + r() * cell, py + r() * cell);
        ctx.lineTo(px + r() * cell, py + r() * cell);
        ctx.stroke();
      }
      break;
    }
    case "wall": {
      // Faux brick: alternating horizontal bands.
      ctx.fillStyle = "#222";
      ctx.fillRect(px, py, cell, cell);
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = Math.max(1, cell / 24);
      const rows = Math.max(2, Math.round(cell / 8));
      for (let i = 0; i <= rows; i++) {
        const ty = py + (i * cell) / rows;
        ctx.beginPath();
        ctx.moveTo(px, ty);
        ctx.lineTo(px + cell, ty);
        ctx.stroke();
      }
      // Stagger vertical dividers.
      for (let i = 0; i < rows; i++) {
        const ty = py + (i * cell) / rows;
        const offset = i % 2 === 0 ? 0 : cell / 2;
        for (let j = 0; j < 3; j++) {
          const tx = px + offset + (j * cell) / 2;
          if (tx > px + cell) continue;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx, ty + cell / rows);
          ctx.stroke();
        }
      }
      break;
    }
    case "door": {
      ctx.fillStyle = "#7a4a22";
      ctx.fillRect(px + cell * 0.1, py + cell * 0.1, cell * 0.8, cell * 0.8);
      ctx.strokeStyle = "#3a200a";
      ctx.lineWidth = Math.max(1, cell / 18);
      ctx.strokeRect(px + cell * 0.1, py + cell * 0.1, cell * 0.8, cell * 0.8);
      ctx.beginPath();
      ctx.arc(px + cell * 0.78, py + cell * 0.5, Math.max(1, cell / 18), 0, Math.PI * 2);
      ctx.fillStyle = "#ffd24a";
      ctx.fill();
      break;
    }
    case "void": {
      // Subtle starfield so void isn't a dead cell.
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.5})`;
        ctx.fillRect(px + r() * cell, py + r() * cell, 1, 1);
      }
      break;
    }
    case "floor":
    default: {
      // Plank-like dark wood: very mild stripes.
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      const stripes = Math.max(2, Math.round(cell / 8));
      for (let i = 0; i < stripes; i++) {
        if (i % 2 === 0) continue;
        ctx.fillRect(px, py + (i * cell) / stripes, cell, cell / stripes);
      }
      break;
    }
  }
}

// ─────────────────────────────────────── Image cache (built-in SVGs + custom uploads)

const imageCache = new Map<string, HTMLImageElement | "loading">();
const pendingResolves = new Map<string, Array<() => void>>();

/**
 * Custom map-asset URLs registered by the client (admin uploads exposed via
 * `/api/map-assets`). Keyed by asset id; objects with `kind = "custom:<id>"`
 * resolve through this map.
 */
const customAssetUrls = new Map<string, string>();

export function registerCustomMapAssets(
  assets: Array<{ id: string; fileUrl: string }>
): void {
  for (const a of assets) {
    customAssetUrls.set(a.id, a.fileUrl);
  }
}

export function clearCustomMapAssets(): void {
  customAssetUrls.clear();
}

function resolveWaiters(key: string) {
  const waiters = pendingResolves.get(key);
  if (waiters) {
    pendingResolves.delete(key);
    for (const fn of waiters) fn();
  }
}

function loadFromSource(
  key: string,
  attach: (img: HTMLImageElement) => void
): void {
  imageCache.set(key, "loading");
  const img = new Image();
  img.decoding = "async";
  img.crossOrigin = "anonymous";
  img.onload = () => {
    imageCache.set(key, img);
    resolveWaiters(key);
  };
  img.onerror = () => {
    imageCache.delete(key);
    // Resolve waiters even on failure so `preloadAssets` never hangs; the
    // renderer simply skips the asset on subsequent draws (the loader will
    // try again next time but `preloadAssets`'s callers are unblocked now).
    resolveWaiters(key);
  };
  attach(img);
}

function svgToImage(svg: string, key: string): HTMLImageElement | null {
  const cached = imageCache.get(key);
  if (cached && cached !== "loading") return cached;
  if (cached === "loading") return null;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  loadFromSource(key, (img) => {
    img.addEventListener(
      "load",
      () => URL.revokeObjectURL(url),
      { once: true }
    );
    img.addEventListener(
      "error",
      () => URL.revokeObjectURL(url),
      { once: true }
    );
    img.src = url;
  });
  return null;
}

function urlToImage(url: string, key: string): HTMLImageElement | null {
  const cached = imageCache.get(key);
  if (cached && cached !== "loading") return cached;
  if (cached === "loading") return null;
  loadFromSource(key, (img) => {
    img.src = url;
  });
  return null;
}

/**
 * Resolves an asset `kind` to a ready-to-draw image, returning `null` while
 * loading or if the asset is unknown. Built-in inline SVGs and uploaded PNGs
 * share the same cache so callers don't need to know the source.
 */
function getAssetImage(kind: string): HTMLImageElement | null {
  if (kind.startsWith("custom:")) {
    const id = kind.slice("custom:".length);
    const fileUrl = customAssetUrls.get(id);
    if (!fileUrl) return null;
    return urlToImage(fileUrl, kind);
  }
  const asset = MAP_ASSET_BY_KIND[kind];
  if (!asset) return null;
  return svgToImage(asset.svg, kind);
}

/**
 * Triggers loading for an asset kind without waiting. `getAssetImage` does
 * the same and is what the renderer uses; this is exported for unit tests
 * and any future eager-warm path.
 */
function ensureAssetLoading(kind: string): boolean {
  if (kind.startsWith("custom:")) {
    const id = kind.slice("custom:".length);
    const fileUrl = customAssetUrls.get(id);
    if (!fileUrl) return false;
    return Boolean(urlToImage(fileUrl, kind));
  }
  const asset = MAP_ASSET_BY_KIND[kind];
  if (!asset) return false;
  return Boolean(svgToImage(asset.svg, kind));
}

/**
 * Returns a Promise that resolves when every asset kind referenced by the
 * map has been rasterised and is ready to draw. The editor uses this to
 * trigger a redraw once images become available.
 */
export function preloadAssets(
  data: Pick<MapDataT, "objects">
): Promise<void> {
  const kinds = new Set(data.objects.map((o) => o.kind));
  const promises: Promise<void>[] = [];
  for (const kind of kinds) {
    if (ensureAssetLoading(kind)) continue;
    promises.push(
      new Promise<void>((resolve) => {
        const arr = pendingResolves.get(kind) ?? [];
        arr.push(resolve);
        pendingResolves.set(kind, arr);
      })
    );
  }
  return Promise.all(promises).then(() => undefined);
}

// ─────────────────────────────────────── Public API

export function drawMap(
  ctx: CanvasRenderingContext2D,
  data: MapDataT,
  cell: number,
  options: DrawOptions = {}
) {
  const { width, height, cells, objects, markers } = data;
  ctx.clearRect(0, 0, width * cell, height * cell);

  // 1. Terrain
  for (let y = 0; y < height; y++) {
    const row = cells[y];
    if (!row) continue;
    for (let x = 0; x < width; x++) {
      const t = row[x];
      if (!t) continue;
      paintTerrain(ctx, t, x, y, cell);
    }
  }

  // 2. Grid lines (optional)
  if (options.showGrid !== false) {
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cell + 0.5, 0);
      ctx.lineTo(x * cell + 0.5, height * cell);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell + 0.5);
      ctx.lineTo(width * cell, y * cell + 0.5);
      ctx.stroke();
    }
  }

  // 3. Objects
  for (const obj of objects) {
    const img = getAssetImage(obj.kind);
    if (!img) continue; // unknown kind, or still loading — repaint will hit again
    const scale = obj.scale ?? 1;
    const size = cell * scale;
    const cx = obj.x * cell;
    const cy = obj.y * cell;
    if (obj.rotation) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
    }
  }

  // 4. Markers
  if (options.showMarkers !== false) {
    for (const m of markers) {
      const cx = (m.x + 0.5) * cell;
      const cy = (m.y + 0.5) * cell;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = "#dc2626";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = Math.max(1, cell / 18);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.max(8, cell * 0.45)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(m.label.slice(0, 1).toUpperCase(), cx, cy);
    }
  }
}

/** A flat colour swatch used by the texture palette buttons. */
export function terrainSwatchColor(t: MapTerrain): string {
  return TERRAIN_BASE[t];
}

/** Draws a single texture preview tile into a small canvas. */
export function drawTerrainSwatch(
  ctx: CanvasRenderingContext2D,
  t: MapTerrain,
  size: number
) {
  paintTerrain(ctx, t, 0, 0, size);
}

void hashCell;
