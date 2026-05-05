"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapAssetClient } from "@/lib/services/map-asset-client";
import type { MapAsset } from "@/lib/db/repository";

const CATEGORIES: Array<{ v: MapAsset["category"]; l: string }> = [
  { v: "nature", l: "Природа" },
  { v: "furniture", l: "Мебель" },
  { v: "structure", l: "Сооружения" },
  { v: "decor", l: "Декор" },
  { v: "custom", l: "Другое" },
];

function suggestSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9а-я ]+/gi, "")
    .replace(/[а-я]/g, "x") // very rough — admins can override
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function AdminMapAssetsPage() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<MapAsset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [nameRu, setNameRu] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [category, setCategory] =
    React.useState<MapAsset["category"]>("custom");
  const [submitting, setSubmitting] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await MapAssetClient.list();
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

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !file || !nameRu || !slug) return;
    setSubmitting(true);
    setError(null);
    try {
      await MapAssetClient.upload(user, { file, slug, nameRu, category });
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

  async function remove(asset: MapAsset) {
    if (!user) return;
    if (!confirm(`Удалить ассет «${asset.nameRu}»?`)) return;
    try {
      await MapAssetClient.remove(user, asset.id);
      setItems((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          Ассеты карт
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Загруженные здесь PNG/SVG-картинки попадают в каталог конструктора
          карт во вкладку «Загруженные» и доступны всем пользователям при
          размещении и просмотре.
        </p>
      </header>

      <form
        onSubmit={upload}
        className="grid gap-4 rounded-xl border border-border/60 bg-background/40 p-5 sm:grid-cols-2"
      >
        <div>
          <Label htmlFor="file">Файл (PNG, JPG, WebP, SVG; до 2 МБ)</Label>
          <input
            id="file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              if (f && !nameRu) {
                const stem = f.name.replace(/\.[^.]+$/, "");
                setNameRu(stem);
                if (!slug) setSlug(suggestSlug(stem));
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
            placeholder="Старый колодец"
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
            placeholder="old-well"
            pattern="[a-z0-9][a-z0-9-]*"
            required
            maxLength={60}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Используется внутри карт; менять можно, но старые карты могут
            ссылаться на старый slug.
          </p>
        </div>
        <div>
          <Label htmlFor="category">Категория</Label>
          <select
            id="category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as MapAsset["category"])
            }
            className="mt-1 block h-10 w-full rounded-md border border-border bg-input px-3 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.v} value={c.v}>
                {c.l}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Загрузка…" : "Загрузить ассет"}
          </Button>
          {error ? (
            <span className="text-sm text-destructive">{error}</span>
          ) : null}
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Загруженные ассеты ({items.length})
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка…</p>
        ) : items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            Пока ничего не загружено.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/40 p-3"
              >
                <div className="flex h-32 items-center justify-center overflow-hidden rounded-md border border-border/40 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.fileUrl}
                    alt={a.nameRu}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{a.nameRu}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.slug} · {a.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(a.sizeBytes / 1024).toFixed(1)} КБ · {a.mimeType}
                  </p>
                </div>
                <Button
                  size="xs"
                  variant="destructive"
                  onClick={() => remove(a)}
                >
                  Удалить
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
