"use client";

import * as React from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SAMPLE_CONTENT } from "@/lib/data/sample-content";
import { CONTENT_TYPE_LABEL_RU } from "@/components/content/labels";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <AuthGuard role="admin">
      <AdminDashboard />
    </AuthGuard>
  );
}

function AdminDashboard() {
  const [tab, setTab] = React.useState<"users" | "content" | "logs">("content");

  const sampleUsers = React.useMemo(() => {
    const seen = new Map<
      string,
      { id: string; username: string; createdAt: string }
    >();
    for (const c of SAMPLE_CONTENT) {
      if (!seen.has(c.authorUsername)) {
        seen.set(c.authorUsername, {
          id: c.authorId,
          username: c.authorUsername,
          createdAt: c.createdAt,
        });
      }
    }
    return Array.from(seen.values());
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">
          Админ-панель
        </h1>
        <p className="mt-2 text-muted-foreground">
          Управление пользователями и модерация контента.
        </p>
      </header>

      <nav className="mb-6 flex gap-1 border-b border-border/60">
        <Tab active={tab === "content"} onClick={() => setTab("content")}>
          Контент
        </Tab>
        <Tab active={tab === "users"} onClick={() => setTab("users")}>
          Пользователи
        </Tab>
        <Tab active={tab === "logs"} onClick={() => setTab("logs")}>
          Журнал
        </Tab>
      </nav>

      {tab === "content" ? (
        <table className="w-full overflow-hidden rounded-xl border border-border/60 text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Заголовок</th>
              <th className="px-4 py-2">Тип</th>
              <th className="px-4 py-2">Автор</th>
              <th className="px-4 py-2">Создано</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {SAMPLE_CONTENT.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2">{c.title}</td>
                <td className="px-4 py-2">{CONTENT_TYPE_LABEL_RU[c.type]}</td>
                <td className="px-4 py-2">@{c.authorUsername}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <Button size="xs" variant="outline">
                      {c.featured ? "Снять с витрины" : "Выделить"}
                    </Button>
                    <Button size="xs" variant="destructive">
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : tab === "users" ? (
        <table className="w-full overflow-hidden rounded-xl border border-border/60 text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Регистрация</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {sampleUsers.map((u) => (
              <tr key={u.username}>
                <td className="px-4 py-2">@{u.username}</td>
                <td className="px-4 py-2 text-muted-foreground">{u.id}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <Button size="xs" variant="outline">
                      Заблокировать
                    </Button>
                    <Button size="xs" variant="destructive">
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          Журнал действий администраторов появится после интеграции с базой
          данных (модель AdminLog, задача 2.6).
        </p>
      )}
    </div>
  );
}

function Tab({
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
        "px-4 py-2 text-sm transition-colors " +
        (active
          ? "border-b-2 border-primary text-primary"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}
