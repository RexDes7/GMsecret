"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/services/api-client";
import type { UserProfile } from "@/lib/db/repository";

type ListResp = { items: UserProfile[]; total: number };

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [role, setRole] = React.useState<"all" | "user" | "admin">("all");
  const [banned, setBanned] = React.useState<"all" | "yes" | "no">("all");

  const reload = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (role !== "all") params.set("role", role);
    if (banned !== "all") params.set("banned", banned === "yes" ? "1" : "0");
    params.set("limit", "300");
    try {
      const res = await apiFetch<ListResp>(
        `/api/admin/users?${params.toString()}`,
        { user }
      );
      setItems(res.items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, q, role, banned]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  async function patch(
    id: string,
    patchBody: { role?: "user" | "admin"; banned?: boolean }
  ) {
    if (!user) return;
    try {
      const updated = await apiFetch<UserProfile>(
        `/api/admin/users/${encodeURIComponent(id)}`,
        { method: "PATCH", user, body: patchBody }
      );
      if (updated) {
        setItems((prev) => prev.map((u) => (u.id === id ? updated : u)));
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function remove(u: UserProfile) {
    if (!user) return;
    if (!confirm(`Удалить пользователя @${u.username} и весь его контент?`))
      return;
    try {
      await apiFetch(`/api/admin/users/${encodeURIComponent(u.id)}`, {
        method: "DELETE",
        user,
      });
      setItems((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          Пользователи
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Список зарегистрированных аккаунтов с быстрыми действиями.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
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
            placeholder="username, email или displayName"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Роль
          </label>
          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value as "all" | "user" | "admin")
            }
            className="h-10 rounded-md border border-border bg-input px-3 text-sm"
          >
            <option value="all">Все</option>
            <option value="user">Пользователи</option>
            <option value="admin">Администраторы</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Бан
          </label>
          <select
            value={banned}
            onChange={(e) =>
              setBanned(e.target.value as "all" | "yes" | "no")
            }
            className="h-10 rounded-md border border-border bg-input px-3 text-sm"
          >
            <option value="all">Все</option>
            <option value="yes">Только заблокированные</option>
            <option value="no">Только активные</option>
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
              <th className="px-3 py-2">Username</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Роль</th>
              <th className="px-3 py-2">Регистрация</th>
              <th className="px-3 py-2">Активность</th>
              <th className="px-3 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Загрузка…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Ничего не найдено.
                </td>
              </tr>
            ) : (
              items.map((u) => {
                const isSelf = u.id === user?.id;
                return (
                  <tr key={u.id} className="align-top">
                    <td className="px-3 py-2">
                      <Link
                        href={`/profile/${u.username}`}
                        className="hover:underline"
                      >
                        @{u.username}
                      </Link>
                      {u.banned ? (
                        <span className="ml-2 rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                          бан
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                    <td className="px-3 py-2">
                      {u.role === "admin" ? "Админ" : "Пользователь"}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {new Date(u.lastSeenAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={isSelf}
                          title={isSelf ? "Нельзя менять собственную роль" : ""}
                          onClick={() =>
                            patch(u.id, {
                              role: u.role === "admin" ? "user" : "admin",
                            })
                          }
                        >
                          {u.role === "admin" ? "Снять админа" : "Сделать админом"}
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={isSelf}
                          title={isSelf ? "Нельзя забанить себя" : ""}
                          onClick={() =>
                            patch(u.id, { banned: !u.banned })
                          }
                        >
                          {u.banned ? "Разблокировать" : "Заблокировать"}
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          disabled={isSelf}
                          title={
                            isSelf ? "Нельзя удалить себя" : "Удалить аккаунт"
                          }
                          onClick={() => remove(u)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
