"use client";

import * as React from "react";
import type { MapDataT } from "@/lib/schemas/content";
import { drawMap, preloadAssets } from "@/lib/maps/renderer";
import { MapAssetClient } from "@/lib/services/map-asset-client";
import { MapFontClient } from "@/lib/services/map-font-client";
import { subscribeFontLoaded } from "@/lib/maps/fonts";

/**
 * Read-only canvas-based preview shared by the modal and the standalone
 * content page so what the author saw in the editor matches what other
 * users see. Cell size auto-fits the available width up to a sensible cap.
 */
export function MapPreview({ data }: { data: MapDataT }) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [cell, setCell] = React.useState(16);
  const [customLoaded, setCustomLoaded] = React.useState(false);

  // Register admin-uploaded custom map assets and fonts with the renderer
  // so `custom:<id>` references in objects render their PNGs and
  // `custom:<slug>` references in text annotations render with the right
  // typeface. We don't block the initial paint; a second paint runs once
  // assets and fonts resolve.
  React.useEffect(() => {
    let cancelled = false;
    Promise.allSettled([MapAssetClient.list(), MapFontClient.list()]).then(
      () => {
        if (!cancelled) setCustomLoaded(true);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // Recompute cell size on mount and on container resize so the map fills
  // the modal/page width without ever overflowing on small screens.
  React.useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const recompute = () => {
      const w = wrap.clientWidth || 0;
      if (!w) return;
      const next = Math.max(8, Math.min(28, Math.floor(w / data.width)));
      setCell(next);
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [data.width]);

  // Repaint the canvas whenever data, cell size, or async resources change.
  React.useEffect(() => {
    const paint = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawMap(ctx, data, cell, { showGrid: false });
    };
    paint();
    let cancelled = false;
    preloadAssets({ objects: data.objects ?? [] }).then(() => {
      if (!cancelled) paint();
    });
    const unsub = subscribeFontLoaded(paint);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [data, cell, customLoaded]);

  return (
    <div ref={wrapRef} className="space-y-3 text-sm">
      <div
        className="overflow-auto rounded-lg border border-border/60 bg-background/40 p-3"
        style={{ maxHeight: "60vh" }}
      >
        <canvas
          ref={canvasRef}
          width={data.width * cell}
          height={data.height * cell}
          className="block max-w-full"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  );
}
