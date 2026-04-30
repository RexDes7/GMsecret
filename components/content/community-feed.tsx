"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ContentTypeEnum,
  type ContentType,
  type ContentRecord,
} from "@/lib/schemas/content";
import { CONTENT_TYPE_LABEL_RU } from "@/components/content/labels";
import { ContentCard } from "@/components/content/content-card";
import { Input } from "@/components/ui/input";
import { ru } from "@/lib/i18n/ru";

const PAGE_SIZE = 12;

/**
 * Pagination invariant (Property 5):
 * For any sorted list, sum of items across pages equals total.length, and
 * pages do not overlap.
 */
export function CommunityFeed({ all }: { all: ContentRecord[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const initialType = sp.get("type") as ContentType | null;

  const [type, setType] = React.useState<ContentType | "all">(
    initialType && ContentTypeEnum.options.includes(initialType)
      ? initialType
      : "all"
  );
  const [search, setSearch] = React.useState(sp.get("q") ?? "");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    let arr = all.filter((c) => c.isPublic);
    if (type !== "all") arr = arr.filter((c) => c.type === type);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [all, type, search]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  React.useEffect(() => {
    // Reset pagination when filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [type, search]);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (search.trim()) params.set("q", search.trim());
    const qs = params.toString();
    router.replace(qs ? `/community?${qs}` : "/community", { scroll: false });
  }, [type, search, router]);

  // Infinite scroll
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && hasMore) {
        setPage((p) => p + 1);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          aria-label={ru.common.search}
          placeholder={`${ru.common.search}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-1">
          <FilterChip
            active={type === "all"}
            onClick={() => setType("all")}
            label={ru.community.filterAll}
          />
          {ContentTypeEnum.options.map((t) => (
            <FilterChip
              key={t}
              active={type === t}
              onClick={() => setType(t)}
              label={CONTENT_TYPE_LABEL_RU[t]}
            />
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          {ru.community.empty}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <ContentCard key={c.id} c={c} highlight={search} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      <p className="text-center text-xs text-muted-foreground">
        Показано {visible.length} из {filtered.length}
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-full px-3 py-1 text-xs transition-colors " +
        (active
          ? "bg-primary text-primary-foreground"
          : "border border-border/60 bg-background/40 text-muted-foreground hover:text-foreground")
      }
    >
      {label}
    </button>
  );
}
