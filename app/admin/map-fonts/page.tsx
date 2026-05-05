"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapFontClient } from "@/lib/services/map-font-client";
import { resolveFontFamily, subscribeFontLoaded } from "@/lib/maps/fonts";
import type { MapFont } from "@/lib/db/repository";

function suggestSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function AdminMapFontsPage() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<MapFont[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [nameRu, setNameRu] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  // Bump on font-loaded events so previews repaint with the new face.
  const [, setTick] = React.useState(0);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await MapFontClient.list();
      setItems(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  React.useEffect(
    () => subscribeFontLoaded(() => setTick((t) => t + 1)),
    []
  );

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !file || !nameRu || !slug) return;
    setSubmitting(true);
    setError(null);
    try {
      await MapFontClient.upload(user, { file, slug, nameRu });
      setFile(null);
      setNameRu("");
      setSlug("");
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(font: MapFont) {
    if (!user) return;
    if (!confirm(`Удалить шрифт «${font.nameRu}»?`)) return;
    try {
      await MapFontClient.remove(user, font.id);
      setItems((prev) => prev.filter((f) => f.id !== font.id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          Шрифты карт
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Загруженные TTF/OTF/WOFF/WOFF2 файлы доступны в инструменте «Текст»
          конструктора карт. Slug используется как имя CSS-семейства, поэтому
          держим его в латинице и без пробелов.
        </p>
      </header>

      <form
        onSubmit={upload}
        className="grid gap-4 rounded-xl border border-border/60 bg-background/40 p-5 sm:grid-cols-2"
      >
        <div>
          <Label htmlFor="file">Файл (TTF/OTF/WOFF/WOFF2; до 4 МБ)</Label>
          <input
            id="file"
            type="file"
            accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              if (f && !nameRu) {
                const stem = f.name.replace(/\.[^.]+$/, "");
                setNameRu(stem);
                if (!slug) setSlug(suggestSlug(f.name));
              }
            }}
            className="mt-1 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/80"
            required
          />
        </div>
        <div>
          <Label htmlFor="nameRu">Название</Label>
          <Input
            id="nameRu"
            value={nameRu}
            onChange={(e) => setNameRu(e.target.value)}
            placeholder="Древние руны"
            required
            maxLength={80}
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug (латиница)</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ancient-runes"
            pattern="[a-z0-9][a-z0-9-]*"
            required
            maxLength={60}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Уникален. Текст на карте ссылается на шрифт через
            <code className="ml-1">custom:{slug || "slug"}</code>.
          </p>
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            className="w-full glow-primary"
            disabled={submitting || !file || !nameRu || !slug}
          >
            {submitting ? "Загружаем…" : "Загрузить"}
          </Button>
        </div>
        {error ? (
          <p className="col-span-full text-sm text-destructive">{error}</p>
        ) : null}
      </form>

      <div>
        <h2 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-semibold">
          Загруженные шрифты ({items.length})
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Загружаем…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Пока ничего нет. Загрузи первый файл выше.
          </p>
        ) : (
          <ul className="grid gap-2">
            {items.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p
                    className="truncate text-base"
                    style={{
                      fontFamily: resolveFontFamily(`custom:${f.slug}`),
                    }}
                  >
                    {f.nameRu}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    custom:{f.slug} · {f.mimeType} ·{" "}
                    {Math.round(f.sizeBytes / 1024)} КБ
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(f)}
                >
                  Удалить
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
