"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/services/api-client";
import { CONTENT_TYPE_LABEL_RU } from "@/components/content/labels";
import type { ContentRecord, ContentType } from "@/lib/schemas/content";

type ListResp = { items: ContentRecord[]; total: number };

const TYPES: Array<ContentType | "all"> = [
  "all",
  "character",
  "map",
  "item",
  "spell",
  "artifact",
  "creature",
];

export default function AdminContentPage() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<ContentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<ContentType | "all">("all");
  const [visibility, setVisibility] = React.useState<
    "all" | "public" | "private"
  >("all");

  const reload = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (type !== "all") params.set("type", type);
    if (visibility !== "all") params.set("visibility", visibility);
    params.set("limit", "200");
    try {
      const res = await apiFetch<ListResp>(
        `/api/admin/content?${params.toString()}`,
        { user }
      );
      setItems(res.items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, q, type, visibility]);

  React.useEffect(() => {
    // Async fetch — `reload` calls setState inside an awaited body, so the
    // synchronous-setState lint rule doesn't apply, but the rule can't see
    // through the indirection. Suppress it for this read-on-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  async function setFlag(
    id: string,
    patch: { isPublic?: boolean; featured?: boolean }
  ) {
    if (!user) return;
    try {
      const updated = await apiFetch<ContentRecord>(
        `/api/admin/content/${encodeURIComponent(id)}`,
        { method: "PATCH", user, body: patch }
      );
      setItems((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(id: string) {
    if (!user) return;
    if (!confirm("Удалить запись?")) return;
    try {
      await apiFetch(`/api/admin/content/${encodeURIComponent(id)}`, {
        method: "DELETE",
        user,
      });
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          Модерация контента
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Управляйте всеми записями: публикация, выделение на витрине, удаление.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="search"
            className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground"
          >
            Поиск
          </label>
          <Input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Название, описание или тег"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Тип
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ContentType | "all")}
            className="h-10 rounded-md border border-border bg-input px-3 text-sm"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "Все типы" : CONTENT_TYPE_LABEL_RU[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Видимость
          </label>
          <select
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value as "all" | "public" | "private")
            }
            className="h-10 rounded-md border border-border bg-input px-3 text-sm"
          >
            <option value="all">Все</option>
            <option value="public">Только публичные</option>
            <option value="private">Только черновики</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Заголовок</th>
              <th className="px-3 py-2">Тип</th>
              <th className="px-3 py-2">Автор</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Просмотры</th>
              <th className="px-3 py-2">Создано</th>
              <th className="px-3 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  Загрузка…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                  Ничего не найдено.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="align-top">
                  <td className="px-3 py-2">
                    <Link
                      href={`/content/${c.id}`}
                      className="hover:underline"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {CONTENT_TYPE_LABEL_RU[c.type]}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/profile/${c.authorUsername}`}
                      className="hover:underline"
                    >
                      @{c.authorUsername}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span>
                        {c.isPublic ? "Публично" : "Черновик"}
                      </span>
                      {c.featured ? (
                        <span className="text-amber-300">★ На витрине</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">
                    {c.views.toLocaleString("ru-RU")}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          setFlag(c.id, { featured: !c.featured })
                        }
                      >
                        {c.featured ? "Снять с витрины" : "Выделить"}
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          setFlag(c.id, { isPublic: !c.isPublic })
                        }
                      >
                        {c.isPublic ? "Скрыть" : "Опубликовать"}
                      </Button>
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => remove(c.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
