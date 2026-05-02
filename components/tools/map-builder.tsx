"use client";

import * as React from "react";
import {
  MapData,
  MapTerrainEnum,
  type MapDataT,
  type MapTerrain,
} from "@/lib/schemas/content";
import { useRouter } from "next/navigation";
import { ContentClient } from "@/lib/services/content-client";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TERRAIN_COLORS: Record<MapTerrain, string> = {
  floor: "#3a3a3a",
  wall: "#0a0a0a",
  door: "#a16207",
  water: "#1d4ed8",
  lava: "#dc2626",
  grass: "#15803d",
  stone: "#525252",
  void: "#000000",
};

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

export function MapBuilder() {
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [width, setWidth] = React.useState(20);
  const [height, setHeight] = React.useState(20);
  const [cells, setCells] = React.useState<MapTerrain[][]>(() =>
    makeGrid(20, 20)
  );
  const [tool, setTool] = React.useState<MapTerrain>("wall");
  const [zoom, setZoom] = React.useState(20);
  const [title, setTitle] = React.useState("");
  const [savedId, setSavedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Resize the grid when the user changes width/height, preserving as much
    // of the existing painted state as possible.
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
  }, [width, height]);

  function paintCell(x: number, y: number) {
    setCells((prev) => {
      const row = prev[y];
      if (!row || row[x] === tool) return prev;
      const nextRow = [...row];
      nextRow[x] = tool;
      const next = [...prev];
      next[y] = nextRow;
      return next;
    });
  }

  function exportPng() {
    const canvas = document.createElement("canvas");
    const cell = 24;
    canvas.width = width * cell;
    canvas.height = height * cell;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = TERRAIN_COLORS[cells[y]![x]!];
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    canvas.toBlob((blob) => {
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
    const data: MapDataT = { width, height, cells, markers: [] };
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

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-xl border border-border/60 bg-card/40 p-4">
          <Label htmlFor="map-title">Название</Label>
          <Input
            id="map-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Подземелье крадущегося ужаса"
          />
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Размер
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="w">Ширина</Label>
              <Input
                id="w"
                type="number"
                min={10}
                max={100}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value || 10))}
              />
            </div>
            <div>
              <Label htmlFor="h">Высота</Label>
              <Input
                id="h"
                type="number"
                min={10}
                max={100}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value || 10))}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="z">Масштаб (px на клетку)</Label>
              <Input
                id="z"
                type="number"
                min={8}
                max={48}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value || 20))}
              />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/40 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Кисть
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {MapTerrainEnum.options.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTool(t)}
                aria-pressed={tool === t}
                className={
                  "flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors " +
                  (tool === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 hover:border-foreground/30")
                }
              >
                <span
                  aria-hidden
                  className="size-3 rounded-sm"
                  style={{ background: TERRAIN_COLORS[t] }}
                />
                {TERRAIN_LABEL_RU[t]}
              </button>
            ))}
          </div>
        </div>
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
            onClick={() => setCells(makeGrid(width, height))}
          >
            Очистить
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
          className="overflow-auto"
          style={{ maxHeight: "70vh" }}
          onMouseLeave={() => {
            /* end painting */
          }}
        >
          <Grid
            cells={cells}
            cell={zoom}
            onPaint={paintCell}
            label={`${width}×${height}`}
          />
        </div>
      </div>
    </form>
  );
}

function Grid({
  cells,
  cell,
  onPaint,
  label,
}: {
  cells: MapTerrain[][];
  cell: number;
  onPaint: (x: number, y: number) => void;
  label: string;
}) {
  const [drag, setDrag] = React.useState(false);
  return (
    <div
      role="grid"
      aria-label={`Карта ${label}`}
      className="select-none"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cells[0]?.length ?? 0}, ${cell}px)`,
        gap: 1,
      }}
      onMouseDown={() => setDrag(true)}
      onMouseUp={() => setDrag(false)}
      onMouseLeave={() => setDrag(false)}
    >
      {cells.map((row, y) =>
        row.map((c, x) => (
          <button
            key={`${x}-${y}`}
            type="button"
            role="gridcell"
            aria-label={`(${x}, ${y}) ${c}`}
            className="border border-black/30 outline-none"
            style={{
              width: cell,
              height: cell,
              background: TERRAIN_COLORS[c],
            }}
            onMouseDown={() => onPaint(x, y)}
            onMouseEnter={() => {
              if (drag) onPaint(x, y);
            }}
          />
        ))
      )}
    </div>
  );
}
