"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { apiFetch } from "@/lib/services/api-client";
import { CONTENT_TYPE_LABEL_RU } from "@/components/content/labels";
import type { ContentType } from "@/lib/schemas/content";

type AnalyticsResponse = {
  totals: {
    users: number;
    content: number;
    publicContent: number;
    featuredContent: number;
    activeUsers7d: number;
    activeUsers30d: number;
    newUsers30d: number;
    bannedUsers: number;
    adminUsers: number;
  };
  contentByType: Record<ContentType, number>;
  series: { contentLast30d: number[]; signupsLast30d: number[] };
  recentContent: Array<{
    id: string;
    title: string;
    type: ContentType;
    authorUsername: string;
    isPublic: boolean;
    featured: boolean;
    createdAt: string;
  }>;
  topByViews: Array<{
    id: string;
    title: string;
    type: ContentType;
    authorUsername: string;
    views: number;
  }>;
  recentUsers: Array<{
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
    banned: boolean;
    createdAt: string;
    lastSeenAt: string;
  }>;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = React.useState<AnalyticsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    apiFetch<AnalyticsResponse>("/api/admin/analytics", { user })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          Дэшборд
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Краткий срез по содержанию сайта и активности пользователей.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!data ? (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
          Загрузка…
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              title="Пользователи"
              value={data.totals.users}
              hint={`Активных за 7 дней: ${data.totals.activeUsers7d}`}
            />
            <Stat
              title="Записей контента"
              value={data.totals.content}
              hint={`Опубликовано: ${data.totals.publicContent}`}
            />
            <Stat
              title="Новых за 30 дней"
              value={data.totals.newUsers30d}
              hint={`Заблокировано: ${data.totals.bannedUsers}`}
            />
            <Stat
              title="Админов"
              value={data.totals.adminUsers}
              hint={`На витрине: ${data.totals.featuredContent}`}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card title="Контент по типам">
              <ul className="space-y-1.5 text-sm">
                {(
                  Object.entries(data.contentByType) as Array<
                    [ContentType, number]
                  >
                ).map(([type, count]) => (
                  <li
                    key={type}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>{CONTENT_TYPE_LABEL_RU[type]}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Активность за 30 дней">
              <p className="mb-3 text-xs text-muted-foreground">
                Регистрации (синий) и созданный контент (оранжевый) по дням.
              </p>
              <Sparkline
                values={data.series.signupsLast30d}
                color="#3b82f6"
                label="Регистрации"
              />
              <Sparkline
                values={data.series.contentLast30d}
                color="#f97316"
                label="Контент"
              />
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card title="Топ по просмотрам">
              {data.topByViews.length ? (
                <ul className="space-y-1.5 text-sm">
                  {data.topByViews.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <Link
                        href={`/content/${c.id}`}
                        className="truncate hover:underline"
                      >
                        {c.title}
                      </Link>
                      <span className="tabular-nums text-muted-foreground">
                        {c.views.toLocaleString("ru-RU")}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Пока нет данных по просмотрам.
                </p>
              )}
            </Card>

            <Card title="Последние записи">
              <ul className="space-y-1.5 text-sm">
                {data.recentContent.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {CONTENT_TYPE_LABEL_RU[c.type]}
                    </span>
                    <Link
                      href={`/content/${c.id}`}
                      className="flex-1 truncate hover:underline"
                    >
                      {c.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      @{c.authorUsername}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section>
            <Card title="Последние регистрации">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-1">Username</th>
                    <th className="py-1">Email</th>
                    <th className="py-1">Роль</th>
                    <th className="py-1">Дата</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {data.recentUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="py-1.5">
                        <Link
                          href={`/profile/${u.username}`}
                          className="hover:underline"
                        >
                          @{u.username}
                        </Link>
                      </td>
                      <td className="py-1.5 text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="py-1.5">
                        {u.role === "admin" ? "Админ" : "Пользователь"}
                        {u.banned ? " · 🚫" : ""}
                      </td>
                      <td className="py-1.5 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  title,
  value,
  hint,
}: {
  title: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 font-[family-name:var(--font-heading)] text-3xl font-bold tabular-nums">
        {value.toLocaleString("ru-RU")}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Sparkline({
  values,
  color,
  label,
}: {
  values: number[];
  color: string;
  label: string;
}) {
  const max = Math.max(1, ...values);
  const w = 240;
  const h = 36;
  const step = w / Math.max(1, values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
    .join(" ");
  const total = values.reduce((s, v) => s + v, 0);
  return (
    <div className="mb-2 flex items-center gap-3">
      <span className="w-24 text-xs text-muted-foreground">{label}</span>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-9 flex-1">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          points={points}
        />
      </svg>
      <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
        {total}
      </span>
    </div>
  );
}
