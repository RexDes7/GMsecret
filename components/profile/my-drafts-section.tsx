"use client";

import * as React from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { ContentClient } from "@/lib/services/content-client";
import { ContentCard } from "@/components/content/content-card";
import type { ContentRecord } from "@/lib/schemas/content";

/**
 * Only rendered when the authenticated viewer is the page owner — shows
 * their non-public drafts (invisible to the SSR response because the
 * server has no cookie/session yet).
 */
export function MyDraftsSection({ username }: { username: string }) {
  const { user, status } = useAuth();
  const [drafts, setDrafts] = React.useState<ContentRecord[] | null>(null);
  const isOwner = status === "authenticated" && user?.username === username;

  React.useEffect(() => {
    if (!isOwner || !user) return;
    let cancelled = false;
    ContentClient.list({ authorUsername: username, onlyPublic: false }, user)
      .then((r) => {
        if (cancelled) return;
        setDrafts(r.items.filter((c) => !c.isPublic));
      })
      .catch(() => {
        if (!cancelled) setDrafts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isOwner, user, username]);

  if (!isOwner) return null;
  if (!drafts || drafts.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 font-[family-name:var(--font-heading)] text-2xl font-semibold">
        Мои черновики
        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
          {drafts.length}
        </span>
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Видны только тебе. Открой запись и включи «Опубликовать», чтобы
        появилась в сообществе.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((c) => (
          <ContentCard key={c.id} c={c} />
        ))}
      </div>
    </section>
  );
}
