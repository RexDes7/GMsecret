"use client";

import * as React from "react";
import {
  MapData,
  MapTerrainEnum,
  type MapDataT,
  type MapObjectT,
  type MapTerrain,
  type MapTextT,
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
import { MapFontClient } from "@/lib/services/map-font-client";
import {
  BUILTIN_FONT_FAMILIES,
  resolveFontFamily,
  subscribeFontLoaded,
} from "@/lib/maps/fonts";
import type {
  MapAsset as CustomMapAsset,
  MapFont as CustomMapFont,
} from "@/lib/db/repository";

type Mode = "texture" | "object" | "brush" | "text" | "marker" | "erase";

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

const MODE_LABELS: Record<Mode, string> = {
  texture: "Текстура",
  object: "Объект",
  brush: "Кисть",
  text: "Текст",
  marker: "Метка",
  erase: "Стереть",
};

const MIN_CELL = 6;
const MAX_CELL = 64;
const FIT_PADDING = 24;

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

function clampCell(n: number): number {
  return Math.max(MIN_CELL, Math.min(MAX_CELL, Math.round(n)));
}

export function MapBuilder() {
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  // Map data state
  const [width, setWidth] = React.useState(20);
  const [height, setHeight] = React.useState(20);
  const [cells, setCells] = React.useState<MapTerrain[][]>(() =>
    makeGrid(20, 20)
  );
  const [objects, setObjects] = React.useState<MapObjectT[]>([]);
  const [markers, setMarkers] = React.useState<MapDataT["markers"]>([]);
  const [texts, setTexts] = React.useState<MapTextT[]>([]);

  // Tool state
  const [mode, setMode] = React.useState<Mode>("texture");
  const [terrain, setTerrain] = React.useState<MapTerrain>("grass");
  const [assetKind, setAssetKind] = React.useState<string>(
    MAP_ASSETS[0]?.kind ?? "tree-oak"
  );
  const [scale, setScale] = React.useState(1);
  const [brushRadius, setBrushRadius] = React.useState(2);
  const [brushDensity, setBrushDensity] = React.useState(0.4);
  const [selectedTextId, setSelectedTextId] = React.useState<string | null>(
    null
  );

  // Viewport state (cell size = visible cell pixel width on canvas).
  const [cell, setCell] = React.useState(28);
  const [autoFit, setAutoFit] = React.useState(true);
  const [showGrid, setShowGrid] = React.useState(true);

  // Form state
  const [title, setTitle] = React.useState("");
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const draggingRef = React.useRef(false);
  const lastBrushPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const textDragRef = React.useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // ────────────────────────────────────────── Custom assets / fonts

  const [customAssets, setCustomAssets] = React.useState<CustomMapAsset[]>([]);
  const [customFonts, setCustomFonts] = React.useState<CustomMapFont[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      MapAssetClient.list()
        .then((items) => {
          if (!cancelled) setCustomAssets(items);
        })
        .catch(() => {});
      MapFontClient.list()
        .then((items) => {
          if (!cancelled) setCustomFonts(items);
        })
        .catch(() => {});
    };
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // ────────────────────────────────────────── Resize the grid

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
    setObjects((prev) =>
      prev.filter((o) => o.x >= 0 && o.x <= width && o.y >= 0 && o.y <= height)
    );
    setMarkers((prev) => prev.filter((m) => m.x < width && m.y < height));
    setTexts((prev) =>
      prev.filter((t) => t.x >= 0 && t.x <= width && t.y >= 0 && t.y <= height)
    );
  }, [width, height]);

  // ────────────────────────────────────────── Auto-fit cell to viewport

  React.useEffect(() => {
    if (!autoFit) return;
    const vp = viewportRef.current;
    if (!vp) return;
    const fit = () => {
      const w = vp.clientWidth;
      const h = vp.clientHeight;
      if (!w || !h) return;
      const byW = Math.floor((w - FIT_PADDING) / width);
      const byH = Math.floor((h - FIT_PADDING) / height);
      const next = clampCell(Math.min(byW, byH));
      setCell(next);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(vp);
    return () => ro.disconnect();
  }, [autoFit, width, height]);

  // ────────────────────────────────────────── Repaint

  const repaint = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data: MapDataT = {
      width,
      height,
      cells,
      markers,
      objects,
      texts,
    };
    drawMap(ctx, data, cell, { showGrid });
  }, [width, height, cells, markers, objects, texts, cell, showGrid]);

  React.useEffect(() => {
    repaint();
  }, [repaint]);

  React.useEffect(() => {
    let cancelled = false;
    preloadAssets({ objects }).then(() => {
      if (!cancelled) repaint();
    });
    return () => {
      cancelled = true;
    };
  }, [objects, repaint]);

  // Repaint once a custom font finishes loading so text using it pops in.
  React.useEffect(() => subscribeFontLoaded(repaint), [repaint]);

  // ────────────────────────────────────────── Painting

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
    setTexts((prev) =>
      prev.filter((t) => {
        const dx = t.x - fx;
        const dy = t.y - fy;
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

  function findTextNear(fx: number, fy: number): MapTextT | null {
    // Hit-test a click against existing text bounding circles. Text is
    // anchored at (x, y) with center alignment, fontSize is in cell units,
    // so we approximate the hit-radius from font size + text length.
    let best: MapTextT | null = null;
    let bestDist = Infinity;
    for (const t of texts) {
      const r =
        Math.max(0.5, t.fontSize) *
        Math.max(0.6, Math.min(1.4, t.text.length * 0.18));
      const dx = t.x - fx;
      const dy = t.y - fy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= r && d < bestDist) {
        bestDist = d;
        best = t;
      }
    }
    return best;
  }

  function addText(fx: number, fy: number) {
    const id = uid();
    const next: MapTextT = {
      id,
      x: Math.max(0.5, Math.min(width - 0.5, fx)),
      y: Math.max(0.5, Math.min(height - 0.5, fy)),
      text: "Текст",
      fontFamily: "serif",
      fontSize: 0.9,
      color: "#ffffff",
      bold: false,
      italic: false,
      align: "center",
      rotation: 0,
    };
    setTexts((prev) => [...prev, next]);
    setSelectedTextId(id);
  }

  function updateText(id: string, patch: Partial<MapTextT>) {
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function removeText(id: string) {
    setTexts((prev) => prev.filter((t) => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  }

  // ────────────────────────────────────────── Mouse

  function eventToCanvasCoords(
    e: React.MouseEvent<HTMLCanvasElement>
  ): { fx: number; fy: number; cx: number; cy: number } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    // Account for any CSS scaling so hit-testing matches the rendered
    // canvas, even when the browser zoom or container width forces the
    // canvas into a smaller display box.
    const scaleX = rect.width === 0 ? 1 : canvas.width / rect.width;
    const scaleY = rect.height === 0 ? 1 : canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const fx = px / cell;
    const fy = py / cell;
    return { fx, fy, cx: Math.floor(fx), cy: Math.floor(fy) };
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
      case "text":
        // Handled in onMouseDown so we can branch on hit-test.
        break;
    }
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return;
    const c = eventToCanvasCoords(e);
    if (!c) return;
    if (mode === "text") {
      const hit = findTextNear(c.fx, c.fy);
      if (hit) {
        setSelectedTextId(hit.id);
        textDragRef.current = {
          id: hit.id,
          offsetX: c.fx - hit.x,
          offsetY: c.fy - hit.y,
        };
      } else {
        addText(c.fx, c.fy);
      }
      return;
    }
    draggingRef.current = true;
    lastBrushPosRef.current = { x: c.fx, y: c.fy };
    applyAt(c.fx, c.fy, c.cx, c.cy);
  }
  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const c = eventToCanvasCoords(e);
    if (!c) return;
    if (mode === "text" && textDragRef.current) {
      const drag = textDragRef.current;
      const nx = Math.max(0, Math.min(width, c.fx - drag.offsetX));
      const ny = Math.max(0, Math.min(height, c.fy - drag.offsetY));
      updateText(drag.id, { x: nx, y: ny });
      return;
    }
    if (!draggingRef.current) return;
    if (mode === "object" || mode === "marker") return;
    applyAt(c.fx, c.fy, c.cx, c.cy);
  }
  function onMouseUp() {
    draggingRef.current = false;
    lastBrushPosRef.current = null;
    textDragRef.current = null;
  }

  // Ctrl + wheel zooms (anchored at cursor), wheel alone scrolls naturally.
  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    setAutoFit(false);
    setCell((prev) => clampCell(prev + (e.deltaY < 0 ? 2 : -2)));
  }

  // ────────────────────────────────────────── Save / export

  async function exportPng() {
    const offscreen = document.createElement("canvas");
    offscreen.width = width * cell;
    offscreen.height = height * cell;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;
    const data: MapDataT = {
      width,
      height,
      cells,
      markers,
      objects,
      texts,
    };
    await preloadAssets({ objects });
    drawMap(ctx, data, cell, { showGrid: false });
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
    const data: MapDataT = {
      width,
      height,
      cells,
      markers,
      objects,
      texts,
    };
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

  // ────────────────────────────────────────── Asset / font groups

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

  const customAssetsByCategory = React.useMemo(() => {
    const groups: Record<"nature" | "furniture" | "structure" | "decor" | "custom", CustomMapAsset[]> = {
      nature: [],
      furniture: [],
      structure: [],
      decor: [],
      custom: [],
    };
    for (const a of customAssets) {
      groups[a.category].push(a);
    }
    return groups;
  }, [customAssets]);

  const cursor =
    mode === "texture"
      ? "crosshair"
      : mode === "marker"
        ? "pointer"
        : mode === "erase"
          ? "not-allowed"
          : mode === "text"
            ? "text"
            : "cell";

  const selectedText = texts.find((t) => t.id === selectedTextId) ?? null;

  // ────────────────────────────────────────── UI

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <aside className="space-y-3">
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
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
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
          <div className="grid grid-cols-3 gap-1.5">
            {(
              ["texture", "object", "brush", "text", "marker", "erase"] as Mode[]
            ).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={
                  "rounded-md border px-2 py-2 text-[11px] font-medium transition-colors " +
                  (mode === m
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border/60 hover:border-foreground/30")
                }
              >
                {MODE_LABELS[m]}
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
                <CategoryRow
                  key={cat}
                  label={ASSET_CATEGORY_LABEL[cat]}
                  builtins={assetsByCategory[cat]}
                  customs={customAssetsByCategory[cat] ?? []}
                  activeKind={assetKind}
                  onSelect={setAssetKind}
                />
              )
            )}
            {customAssetsByCategory.custom.length > 0 ? (
              <CategoryRow
                label="Прочее (кастом)"
                builtins={[]}
                customs={customAssetsByCategory.custom}
                activeKind={assetKind}
                onSelect={setAssetKind}
              />
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

        {mode === "text" ? (
          <Section title="Текст на карте">
            <p className="mb-3 text-[11px] text-muted-foreground">
              Кликни по карте — добавит надпись. Кликни по существующей
              надписи и тяни — переместить.
            </p>
            {selectedText ? (
              <TextEditor
                value={selectedText}
                customFonts={customFonts}
                onChange={(patch) => updateText(selectedText.id, patch)}
                onRemove={() => removeText(selectedText.id)}
              />
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Выбери надпись на карте, чтобы редактировать её свойства.
              </p>
            )}
            {texts.length > 0 ? (
              <div className="mt-3 max-h-48 overflow-auto rounded-md border border-border/40 bg-background/30 p-1">
                {texts.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTextId(t.id)}
                    className={
                      "flex w-full items-center justify-between gap-2 rounded px-2 py-1 text-left text-[11px] transition-colors " +
                      (t.id === selectedTextId
                        ? "bg-primary/15 text-primary"
                        : "hover:bg-foreground/5")
                    }
                  >
                    <span className="truncate">{t.text}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {t.x.toFixed(1)}, {t.y.toFixed(1)}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
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
              Удаляет объекты и текст в круге под курсором.
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

        <div className="flex flex-col gap-2 pt-1">
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
              setTexts([]);
              setSelectedTextId(null);
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

      <div className="flex flex-col rounded-xl border border-border/60 bg-card/40 p-3">
        <ZoomBar
          cell={cell}
          autoFit={autoFit}
          onZoomIn={() => {
            setAutoFit(false);
            setCell((c) => clampCell(c + 2));
          }}
          onZoomOut={() => {
            setAutoFit(false);
            setCell((c) => clampCell(c - 2));
          }}
          onFit={() => setAutoFit(true)}
          onReset={() => {
            setAutoFit(false);
            setCell(28);
          }}
        />
        <div
          ref={viewportRef}
          className="mt-3 flex-1 overflow-auto rounded-md bg-background/40"
          style={{ minHeight: 480, maxHeight: "78vh" }}
        >
          <div className="inline-block p-2">
            <canvas
              ref={canvasRef}
              width={width * cell}
              height={height * cell}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onWheel={onWheel}
              style={{ display: "block", cursor }}
            />
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Объектов: {objects.length} · меток: {markers.length} · текста:{" "}
          {texts.length} · клетка: {cell}px ·{" "}
          <span className="opacity-70">
            Ctrl + колесо — зум, перетащи прокрутку — пан
          </span>
        </p>
      </div>
    </form>
  );
}

// ────────────────────────────────────────── Sub-components

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ZoomBar({
  cell,
  autoFit,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
}: {
  cell: number;
  autoFit: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border/60 bg-background/30 px-2 py-1.5 text-xs">
      <Button type="button" size="sm" variant="ghost" onClick={onZoomOut}>
        −
      </Button>
      <span className="w-10 text-center tabular-nums">{cell}px</span>
      <Button type="button" size="sm" variant="ghost" onClick={onZoomIn}>
        +
      </Button>
      <span className="mx-1 h-5 w-px bg-border/60" />
      <Button
        type="button"
        size="sm"
        variant={autoFit ? "secondary" : "ghost"}
        onClick={onFit}
      >
        По экрану
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onReset}>
        100%
      </Button>
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

function CategoryRow({
  label,
  builtins,
  customs,
  activeKind,
  onSelect,
}: {
  label: string;
  builtins: MapAsset[];
  customs: CustomMapAsset[];
  activeKind: string;
  onSelect: (kind: string) => void;
}) {
  if (!builtins.length && !customs.length) return null;
  return (
    <div className="mb-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {builtins.map((a) => (
          <AssetButton
            key={a.kind}
            asset={a}
            active={activeKind === a.kind}
            onSelect={() => onSelect(a.kind)}
          />
        ))}
        {customs.map((a) => {
          const kind = `custom:${a.id}`;
          return (
            <CustomAssetButton
              key={a.id}
              asset={a}
              active={activeKind === kind}
              onSelect={() => onSelect(kind)}
            />
          );
        })}
      </div>
    </div>
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
    () => `data:image/svg+xml;utf8,${encodeURIComponent(asset.svg)}`,
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
        "relative flex aspect-square items-center justify-center rounded-md border bg-background/40 transition-colors " +
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
      <span
        className="absolute bottom-0.5 right-0.5 rounded-sm bg-primary/80 px-1 text-[8px] font-bold text-primary-foreground"
        aria-hidden
      >
        ★
      </span>
    </button>
  );
}

function TextEditor({
  value,
  customFonts,
  onChange,
  onRemove,
}: {
  value: MapTextT;
  customFonts: CustomMapFont[];
  onChange: (patch: Partial<MapTextT>) => void;
  onRemove: () => void;
}) {
  // Live preview uses the same family-resolution helper as the renderer
  // so what you see in the side panel matches what the canvas draws.
  const previewFamily = resolveFontFamily(value.fontFamily);
  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="text-content">Текст</Label>
        <textarea
          id="text-content"
          value={value.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={2}
          className="block w-full resize-y rounded-md border border-border/60 bg-input px-2 py-1 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <Label htmlFor="text-font">Шрифт</Label>
        <select
          id="text-font"
          value={value.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="block w-full rounded-md border border-border/60 bg-input px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          style={{ fontFamily: previewFamily }}
        >
          {BUILTIN_FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
          {customFonts.map((f) => (
            <option key={f.slug} value={`custom:${f.slug}`}>
              {f.nameRu}
            </option>
          ))}
        </select>
        {customFonts.length === 0 ? (
          <p className="mt-1 text-[10px] text-muted-foreground">
            Добавь свои шрифты в админке (страница «Шрифты карт»).
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          id="text-size"
          label="Размер (клетки)"
          value={value.fontSize}
          onChange={(n) => onChange({ fontSize: n })}
          min={0.2}
          max={8}
          step={0.1}
        />
        <NumberField
          id="text-rot"
          label="Поворот°"
          value={value.rotation}
          onChange={(n) => onChange({ rotation: n })}
          min={-360}
          max={360}
          step={5}
        />
      </div>
      <div>
        <Label htmlFor="text-color">Цвет</Label>
        <input
          id="text-color"
          type="color"
          value={value.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="h-9 w-full cursor-pointer rounded-md border border-border/60 bg-input p-1"
        />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <ToggleBtn
          active={value.bold}
          onClick={() => onChange({ bold: !value.bold })}
        >
          Жирный
        </ToggleBtn>
        <ToggleBtn
          active={value.italic}
          onClick={() => onChange({ italic: !value.italic })}
        >
          Курсив
        </ToggleBtn>
        <select
          value={value.align}
          onChange={(e) =>
            onChange({ align: e.target.value as "left" | "center" | "right" })
          }
          className="rounded-md border border-border/60 bg-input px-1 text-xs"
        >
          <option value="left">Слева</option>
          <option value="center">По центру</option>
          <option value="right">Справа</option>
        </select>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={onRemove}
      >
        Удалить надпись
      </Button>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-md border px-1 py-1.5 text-[11px] font-medium transition-colors " +
        (active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border/60 hover:border-foreground/30")
      }
    >
      {children}
    </button>
  );
}
