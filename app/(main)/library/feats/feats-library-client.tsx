"use client";

import * as React from "react";
import Link from "next/link";
import {
  FilterGroup,
  FiltersToggle,
  ResetButton,
  SearchInput,
} from "@/components/reference/library-filters";
import type { TtgFeatListItem } from "@/lib/reference/ttg-client";

export function FeatsLibraryClient({
  items,
}: {
  items: TtgFeatListItem[];
}) {
  const [q, setQ] = React.useState("");
  const [categories, setCategories] = React.useState<Set<string>>(new Set());
  const [sources, setSources] = React.useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const allCategories = React.useMemo(
    () =>
      Array.from(
        new Set(items.map((i) => i.category).filter((c): c is string => !!c))
      ).sort((a, b) => a.localeCompare(b, "ru")),
    [items]
  );
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
      if (categories.size && !categories.has(i.category)) return false;
      const sourceLabel = i.source?.name?.label;
      if (sources.size && (!sourceLabel || !sources.has(sourceLabel)))
        return false;
      if (ql) {
        const hay =
          `${i.name.rus} ${i.name.eng ?? ""} ${i.category}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [items, q, categories, sources]);

  const reset = () => {
    setQ("");
    setCategories(new Set());
    setSources(new Set());
  };

  const activeFilterCount = categories.size + sources.size + (q ? 1 : 0);

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
            placeholder="по названию или категории"
          />
        </div>
        <FilterGroup<string>
          title="Категория"
          options={allCategories}
          selected={categories}
          onChange={setCategories}
        />
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

        <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
          {filtered.map((it) => (
            <li key={it.url}>
              <Link
                href={`/library/feats/${it.url}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {it.name.rus}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {it.category}
                  </span>
                </span>
                <span className="hidden shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
                  {it.source?.name?.label}
                </span>
              </Link>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">
              Ничего не найдено по выбранным фильтрам.
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
