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
  topByViews: Array<{
    id: string;
    title: string;
    type: ContentType;
    authorUsername: string;
    views: number;
  }>;
};

export default function AdminAnalyticsPage() {
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
    <div className="space-y-6">
      <header>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          Аналитика
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Подробный срез по последним 30 дням, разбивка по типам контента и
          топу просмотров.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!data ? (
        <p className="text-sm text-muted-foreground">Загрузка…</p>
      ) : (
        <>
          <Card title="Активность за 30 дней">
            <BarChart
              values={data.series.signupsLast30d}
              label="Регистрации"
              color="#3b82f6"
            />
            <BarChart
              values={data.series.contentLast30d}
              label="Контент"
              color="#f97316"
            />
          </Card>

          <Card title="Контент по типам">
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.entries(data.contentByType) as Array<
                [ContentType, number]
              >).map(([t, n]) => {
                const max = Math.max(1, ...Object.values(data.contentByType));
                return (
                  <div key={t} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{CONTENT_TYPE_LABEL_RU[t]}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {n}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-muted/40">
                      <div
                        className="h-full rounded bg-primary"
                        style={{ width: `${(n / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Топ-10 по просмотрам">
            {data.topByViews.length ? (
              <ol className="space-y-1.5 text-sm">
                {data.topByViews.map((c, i) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <span className="w-5 text-right text-xs tabular-nums text-muted-foreground">
                      {i + 1}.
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
                    <span className="w-16 text-right tabular-nums text-muted-foreground">
                      {c.views.toLocaleString("ru-RU")}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                Нет данных по просмотрам.
              </p>
            )}
          </Card>
        </>
      )}
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

function BarChart({
  values,
  label,
  color,
}: {
  values: number[];
  label: string;
  color: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {values.reduce((s, v) => s + v, 0)} за 30 дней
        </span>
      </div>
      <div className="flex h-16 items-end gap-px">
        {values.map((v, i) => (
          <div
            key={i}
            title={`${v}`}
            className="flex-1 rounded-sm"
            style={{
              height: `${Math.max(2, (v / max) * 100)}%`,
              backgroundColor: color,
              opacity: v ? 0.85 : 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
