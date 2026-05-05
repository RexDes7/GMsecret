"use client";

import * as React from "react";
import Link from "next/link";
import {
  FilterGroup,
  FiltersToggle,
  ResetButton,
  SearchInput,
} from "@/components/reference/library-filters";
import type { TtgSpeciesListItem } from "@/lib/reference/ttg-client";

export function SpeciesLibraryClient({
  items,
}: {
  items: TtgSpeciesListItem[];
}) {
  const [q, setQ] = React.useState("");
  const [sources, setSources] = React.useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const allSources = React.useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((i) => i.source?.name?.label)
            .filter((x): x is string => !!x)
        )
      ).sort(),
    [items]
  );

  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((i) => {
      const sourceLabel = i.source?.name?.label;
      if (sources.size && (!sourceLabel || !sources.has(sourceLabel)))
        return false;
      if (ql) {
        const hay = `${i.name.rus} ${i.name.eng ?? ""}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [items, q, sources]);

  const reset = () => {
    setQ("");
    setSources(new Set());
  };

  const activeFilterCount = sources.size + (q ? 1 : 0);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside
        className={`${
          filtersOpen ? "block" : "hidden"
        } space-y-5 rounded-xl border border-border/60 bg-card/40 p-5 lg:block`}
      >
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
            Поиск
          </p>
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="по названию"
          />
        </div>
        <FilterGroup<string>
          title="Источник"
          options={allSources}
          selected={sources}
          onChange={setSources}
        />
        <ResetButton count={activeFilterCount} onReset={reset} />
      </aside>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} из {items.length}
          </p>
          <FiltersToggle
            open={filtersOpen}
            onToggle={() => setFiltersOpen((v) => !v)}
            count={activeFilterCount}
          />
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => {
            const img = it.image
              ? it.image.startsWith("http")
                ? it.image
                : `https://new.ttg.club${it.image}`
              : null;
            return (
              <li key={it.url}>
                <Link
                  href={`/library/species/${it.url}`}
                  className="group block overflow-hidden rounded-xl border border-border/60 bg-card/40 transition-colors hover:border-primary/40"
                >
                  {img ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
                      {/* User-served URL from ttg.club CDN; see content-card.tsx note. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={it.name.rus}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="p-4">
                    <p className="truncate font-semibold">{it.name.rus}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {it.source?.name?.label}
                      {it.hasLineages ? " · с подвидами" : ""}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="col-span-full px-4 py-10 text-center text-sm text-muted-foreground">
              Ничего не найдено по выбранным фильтрам.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
