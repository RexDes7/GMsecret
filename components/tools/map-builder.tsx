"use client";

import * as React from "react";
import {
  MapData,
  MapTerrainEnum,
  type MapDataT,
  type MapObjectT,
  type MapTerrain,
} from "@/lib/schemas/content";
import { useRouter } from "next/navigation";
import { ContentClient } from "@/lib/services/content-client";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ASSET_CATEGORY_LABEL,
  MAP_ASSETS,
  type AssetCategory,
  type MapAsset,
} from "@/lib/maps/asset-catalog";
import {
  drawMap,
  drawTerrainSwatch,
  preloadAssets,
} from "@/lib/maps/renderer";
import { MapAssetClient } from "@/lib/services/map-asset-client";
import type { MapAsset as CustomMapAsset } from "@/lib/db/repository";

type Mode = "texture" | "object" | "brush" | "marker" | "erase";

const TERRAIN_LABEL_RU: Record<MapTerrain, string> = {
  floor: "Пол",
  wall: "Стена",
  door: "Дверь",
  water: "Вода",
  lava: "Лава",
  grass: "Трава",
  stone: "Камень",
  void: "Пустота",
};

function makeGrid(
  w: number,
  h: number,
  fill: MapTerrain = "floor"
): MapTerrain[][] {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function MapBuilder() {
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [width, setWidth] = React.useState(20);
  const [height, setHeight] = React.useState(20);
  const [cells, setCells] = React.useState<MapTerrain[][]>(() =>
    makeGrid(20, 20)
  );
  const [objects, setObjects] = React.useState<MapObjectT[]>([]);
  const [markers, setMarkers] = React.useState<MapDataT["markers"]>([]);

  const [mode, setMode] = React.useState<Mode>("texture");
  const [terrain, setTerrain] = React.useState<MapTerrain>("grass");
  const [assetKind, setAssetKind] = React.useState<string>(
    MAP_ASSETS[0]?.kind ?? "tree-oak"
  );
  const [scale, setScale] = React.useState(1);
  const [brushRadius, setBrushRadius] = React.useState(2);
  const [brushDensity, setBrushDensity] = React.useState(0.4);

  const [zoom, setZoom] = React.useState(28);
  const [showGrid, setShowGrid] = React.useState(true);
  const [title, setTitle] = React.useState("");
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const draggingRef = React.useRef(false);
  const lastBrushPosRef = React.useRef<{ x: number; y: number } | null>(null);

  // Admin-uploaded custom map assets — loaded once and exposed as the
  // "custom" category in the asset picker.
  const [customAssets, setCustomAssets] = React.useState<CustomMapAsset[]>([]);
  React.useEffect(() => {
    let cancelled = false;
    MapAssetClient.list()
      .then((items) => {
        if (!cancelled) setCustomAssets(items);
      })
      .catch(() => {
        /* tolerate offline / 404 — picker just won't show custom tab */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Resize the grid when width/height change, preserving painted state.
  // The intentional in-effect setState is the simplest way to keep cells/
  // objects/markers in sync with width/height; the alternative (deriving
  // cells from {w, h}) would clobber paint history on every resize.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCells((prev) => {
      const next = makeGrid(width, height);
      for (let y = 0; y < Math.min(prev.length, height); y++) {
        for (let x = 0; x < Math.min(prev[y]!.length, width); x++) {
          next[y]![x] = prev[y]![x]!;
        }
      }
      return next;
    });
    // Drop objects/markers that fell outside the new bounds.
    setObjects((prev) =>
      prev.filter((o) => o.x >= 0 && o.x <= width && o.y >= 0 && o.y <= height)
    );
    setMarkers((prev) => prev.filter((m) => m.x < width && m.y < height));
  }, [width, height]);

  // Repaint whenever any input to the renderer changes.
  const repaint = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data: MapDataT = { width, height, cells, markers, objects };
    drawMap(ctx, data, zoom, { showGrid });
  }, [width, height, cells, markers, objects, zoom, showGrid]);

  React.useEffect(() => {
    repaint();
  }, [repaint]);

  // Re-trigger repaint once SVG assets finish loading.
  React.useEffect(() => {
    let cancelled = false;
    preloadAssets({ objects }).then(() => {
      if (!cancelled) repaint();
    });
    return () => {
      cancelled = true;
    };
  }, [objects, repaint]);

  // ─────────────────────────── Painting helpers

  function paintCell(cx: number, cy: number) {
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) return;
    setCells((prev) => {
      const row = prev[cy];
      if (!row || row[cx] === terrain) return prev;
      const nextRow = [...row];
      nextRow[cx] = terrain;
      const next = [...prev];
      next[cy] = nextRow;
      return next;
    });
  }

  function placeObject(fx: number, fy: number) {
    if (fx < 0 || fy < 0 || fx > width || fy > height) return;
    setObjects((prev) => [
      ...prev,
      { id: uid(), kind: assetKind, x: fx, y: fy, scale },
    ]);
  }

  function scatterBrush(fx: number, fy: number) {
    // Distribute objects in a disc around (fx, fy) with brushDensity. Use the
    // distance from the previous brush position to scale the count so a
    // slow-moving cursor doesn't dump a huge pile in one spot.
    const last = lastBrushPosRef.current;
    const dx = last ? fx - last.x : 0;
    const dy = last ? fy - last.y : 0;
    const dist = Math.max(0.4, Math.sqrt(dx * dx + dy * dy));
    const count = Math.max(1, Math.round(brushDensity * dist * 2));
    const created: MapObjectT[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * brushRadius;
      const ox = fx + Math.cos(angle) * radius;
      const oy = fy + Math.sin(angle) * radius;
      if (ox < 0 || oy < 0 || ox > width || oy > height) continue;
      const jitterScale = scale * (0.85 + Math.random() * 0.3);
      const rotation = (Math.random() - 0.5) * 12;
      created.push({
        id: uid(),
        kind: assetKind,
        x: ox,
        y: oy,
        scale: jitterScale,
        rotation,
      });
    }
    if (created.length) setObjects((prev) => [...prev, ...created]);
    lastBrushPosRef.current = { x: fx, y: fy };
  }

  function eraseAt(fx: number, fy: number) {
    const r = Math.max(0.6, brushRadius);
    setObjects((prev) =>
      prev.filter((o) => {
        const dx = o.x - fx;
        const dy = o.y - fy;
        return dx * dx + dy * dy > r * r;
      })
    );
  }

  function addMarker(cx: number, cy: number) {
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) return;
    if (markers.length >= 256) return;
    const label = String(markers.length + 1);
    setMarkers((prev) => [...prev, { id: uid(), x: cx, y: cy, label }]);
  }

  // ─────────────────────────── Mouse handling

  function eventToCanvasCoords(
    e: React.MouseEvent<HTMLCanvasElement>
  ): { fx: number; fy: number; cx: number; cy: number } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const fx = px / zoom;
    const fy = py / zoom;
    return {
      fx,
      fy,
      cx: Math.floor(fx),
      cy: Math.floor(fy),
    };
  }

  function applyAt(fx: number, fy: number, cx: number, cy: number) {
    switch (mode) {
      case "texture":
        paintCell(cx, cy);
        break;
      case "object":
        placeObject(fx, fy);
        break;
      case "brush":
        scatterBrush(fx, fy);
        break;
      case "marker":
        addMarker(cx, cy);
        break;
      case "erase":
        eraseAt(fx, fy);
        break;
    }
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return;
    const c = eventToCanvasCoords(e);
    if (!c) return;
    draggingRef.current = true;
    lastBrushPosRef.current = { x: c.fx, y: c.fy };
    applyAt(c.fx, c.fy, c.cx, c.cy);
  }
  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!draggingRef.current) return;
    if (mode === "object" || mode === "marker") return; // single-shot tools
    const c = eventToCanvasCoords(e);
    if (!c) return;
    applyAt(c.fx, c.fy, c.cx, c.cy);
  }
  function onMouseUp() {
    draggingRef.current = false;
    lastBrushPosRef.current = null;
  }

  // ─────────────────────────── Save / export

  async function exportPng() {
    // Render to a fresh offscreen canvas with `showGrid: false` so the
    // exported file never contains the editor grid overlay regardless of
    // the on-screen toggle. Wait for assets to finish loading first so
    // brush-painted forests/furniture don't disappear from the export.
    const offscreen = document.createElement("canvas");
    offscreen.width = width * zoom;
    offscreen.height = height * zoom;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;
    const data: MapDataT = { width, height, cells, markers, objects };
    await preloadAssets({ objects });
    drawMap(ctx, data, zoom, { showGrid: false });
    offscreen.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "map"}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const data: MapDataT = { width, height, cells, markers, objects };
    const parsed = MapData.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Ошибка валидации");
      return;
    }
    setError(null);
    if (!user) {
      window.localStorage.setItem(
        "gmsh:map-draft",
        JSON.stringify({ title, data })
      );
      setSavedId("draft");
      router.push("/login?redirect=/tools/maps");
      return;
    }
    setSubmitting(true);
    try {
      const r = await ContentClient.create(
        {
          title: title || "Карта",
          description: "",
          isPublic: false,
          tags: [],
          type: "map",
          data: parsed.data,
        },
        user
      );
      setSavedId(r.id);
      window.localStorage.removeItem("gmsh:map-draft");
    } catch (err) {
      setError((err as Error).message || "unknown");
    } finally {
      setSubmitting(false);
    }
  }

  // ─────────────────────────── Asset picker grouping

  const assetsByCategory = React.useMemo(() => {
    const groups: Record<AssetCategory, MapAsset[]> = {
      nature: [],
      furniture: [],
      structure: [],
      decor: [],
    };
    for (const a of MAP_ASSETS) groups[a.category].push(a);
    return groups;
  }, []);

  const cursor =
    mode === "texture"
      ? "crosshair"
      : mode === "marker"
        ? "pointer"
        : mode === "erase"
          ? "not-allowed"
          : "cell";

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <Section title="Карта">
          <Label htmlFor="map-title">Название</Label>
          <Input
            id="map-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Подземелье крадущегося ужаса"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <NumberField
              id="w"
              label="Ширина"
              value={width}
              onChange={setWidth}
              min={10}
              max={100}
            />
            <NumberField
              id="h"
              label="Высота"
              value={height}
              onChange={setHeight}
              min={10}
              max={100}
            />
            <NumberField
              id="z"
              label="Масштаб (px/клетка)"
              value={zoom}
              onChange={setZoom}
              min={12}
              max={64}
              cls="col-span-2"
            />
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="size-4 rounded border-border bg-input accent-primary"
            />
            Показывать сетку
          </label>
        </Section>

        <Section title="Режим">
          <div className="grid grid-cols-5 gap-1">
            {(
              [
                { v: "texture", l: "Текст." },
                { v: "object", l: "Объект" },
                { v: "brush", l: "Кисть" },
                { v: "marker", l: "Метка" },
                { v: "erase", l: "Стереть" },
              ] as { v: Mode; l: string }[]
            ).map((m) => (
              <button
                key={m.v}
                type="button"
                onClick={() => setMode(m.v)}
                aria-pressed={mode === m.v}
                className={
                  "rounded-md border px-1.5 py-2 text-[11px] transition-colors " +
                  (mode === m.v
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 hover:border-foreground/30")
                }
              >
                {m.l}
              </button>
            ))}
          </div>
        </Section>

        {mode === "texture" ? (
          <Section title="Текстура">
            <div className="grid grid-cols-2 gap-2">
              {MapTerrainEnum.options.map((t) => (
                <TerrainSwatchButton
                  key={t}
                  terrain={t}
                  active={terrain === t}
                  onSelect={() => setTerrain(t)}
                />
              ))}
            </div>
          </Section>
        ) : null}

        {mode === "object" || mode === "brush" ? (
          <Section title="Каталог объектов">
            {(["nature", "furniture", "structure", "decor"] as const).map(
              (cat) => (
                <div key={cat} className="mb-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {ASSET_CATEGORY_LABEL[cat]}
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {assetsByCategory[cat].map((a) => (
                      <AssetButton
                        key={a.kind}
                        asset={a}
                        active={assetKind === a.kind}
                        onSelect={() => setAssetKind(a.kind)}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
            {customAssets.length > 0 ? (
              <div className="mb-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Загруженные (от админов)
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {customAssets.map((a) => {
                    const kind = `custom:${a.id}`;
                    return (
                      <CustomAssetButton
                        key={a.id}
                        asset={a}
                        active={assetKind === kind}
                        onSelect={() => setAssetKind(kind)}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <NumberField
                id="scale"
                label="Размер"
                value={scale}
                onChange={setScale}
                min={0.4}
                max={3}
                step={0.1}
              />
              {mode === "brush" ? (
                <NumberField
                  id="radius"
                  label="Радиус"
                  value={brushRadius}
                  onChange={setBrushRadius}
                  min={0.5}
                  max={10}
                  step={0.5}
                />
              ) : null}
              {mode === "brush" ? (
                <NumberField
                  id="density"
                  label="Плотность"
                  value={brushDensity}
                  onChange={setBrushDensity}
                  min={0.05}
                  max={2}
                  step={0.05}
                  cls="col-span-2"
                />
              ) : null}
            </div>
          </Section>
        ) : null}

        {mode === "erase" ? (
          <Section title="Ластик">
            <NumberField
              id="erase-r"
              label="Радиус"
              value={brushRadius}
              onChange={setBrushRadius}
              min={0.5}
              max={10}
              step={0.5}
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Удаляет объекты в круге под курсором. Текстуру сбрасывайте через
              режим «Текстура» → «Пол».
            </p>
          </Section>
        ) : null}

        {mode === "marker" ? (
          <Section title="Метки">
            <p className="text-[11px] text-muted-foreground">
              Кликни по клетке — добавит пронумерованную метку.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => setMarkers([])}
            >
              Очистить все метки
            </Button>
          </Section>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            className="w-full glow-primary"
            disabled={submitting}
          >
            {submitting ? "Сохраняем…" : "Сохранить карту"}
          </Button>
          <Button type="button" variant="outline" onClick={exportPng}>
            Экспорт в PNG
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setCells(makeGrid(width, height));
              setObjects([]);
              setMarkers([]);
            }}
          >
            Очистить всё
          </Button>
        </div>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {savedId ? (
          <p className="text-xs text-primary">
            {savedId === "draft"
              ? "Черновик сохранён локально."
              : "Сохранено: " + savedId}
          </p>
        ) : null}
      </aside>

      <div className="rounded-xl border border-border/60 bg-card/40 p-3">
        <div
          className="overflow-auto rounded-md"
          style={{ maxHeight: "75vh" }}
        >
          <canvas
            ref={canvasRef}
            width={width * zoom}
            height={height * zoom}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{ display: "block", cursor }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Объектов: {objects.length} · меток: {markers.length}
        </p>
      </div>
    </form>
  );
}

// ─────────────────────────────────────── Sub-components

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  cls,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  cls?: string;
}) {
  return (
    <div className={cls}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isFinite(n)) return;
          let clamped = n;
          if (min !== undefined) clamped = Math.max(min, clamped);
          if (max !== undefined) clamped = Math.min(max, clamped);
          onChange(clamped);
        }}
      />
    </div>
  );
}

function TerrainSwatchButton({
  terrain,
  active,
  onSelect,
}: {
  terrain: MapTerrain;
  active: boolean;
  onSelect: () => void;
}) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  React.useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    drawTerrainSwatch(ctx, terrain, 24);
  }, [terrain]);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={
        "flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors " +
        (active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/60 hover:border-foreground/30")
      }
    >
      <canvas
        ref={ref}
        width={24}
        height={24}
        aria-hidden
        className="rounded-sm"
      />
      {TERRAIN_LABEL_RU[terrain]}
    </button>
  );
}

function AssetButton({
  asset,
  active,
  onSelect,
}: {
  asset: MapAsset;
  active: boolean;
  onSelect: () => void;
}) {
  const dataUrl = React.useMemo(
    () =>
      `data:image/svg+xml;utf8,${encodeURIComponent(asset.svg)}`,
    [asset.svg]
  );
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      title={asset.nameRu}
      className={
        "flex aspect-square items-center justify-center rounded-md border bg-background/40 transition-colors " +
        (active
          ? "border-primary ring-1 ring-primary"
          : "border-border/60 hover:border-foreground/30")
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt={asset.nameRu}
        className="size-9"
        draggable={false}
      />
    </button>
  );
}

function CustomAssetButton({
  asset,
  active,
  onSelect,
}: {
  asset: CustomMapAsset;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      title={asset.nameRu}
      className={
        "flex aspect-square items-center justify-center rounded-md border bg-background/40 transition-colors " +
        (active
          ? "border-primary ring-1 ring-primary"
          : "border-border/60 hover:border-foreground/30")
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset.fileUrl}
        alt={asset.nameRu}
        className="size-9 object-contain"
        draggable={false}
      />
    </button>
  );
}
