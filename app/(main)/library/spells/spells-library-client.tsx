"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Filter, X } from "lucide-react";
import type { TtgSpellListItem } from "@/lib/reference/ttg-client";

const LEVEL_LABEL = (l: number) => (l === 0 ? "Заговор" : `${l} уровень`);

export function SpellsLibraryClient({
  items,
}: {
  items: TtgSpellListItem[];
}) {
  const [q, setQ] = React.useState("");
  const [levels, setLevels] = React.useState<Set<number>>(new Set());
  const [schools, setSchools] = React.useState<Set<string>>(new Set());
  const [sources, setSources] = React.useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  // Build option lists from the data once.
  const allLevels = React.useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.level))).sort((a, b) => a - b),
    [items]
  );
  const allSchools = React.useMemo(
    () => Array.from(new Set(items.map((i) => i.school))).sort(),
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
      if (levels.size && !levels.has(i.level)) return false;
      if (schools.size && !schools.has(i.school)) return false;
      const sourceLabel = i.source?.name?.label;
      if (sources.size && (!sourceLabel || !sources.has(sourceLabel)))
        return false;
      if (ql) {
        const hay =
          `${i.name.rus} ${i.name.eng ?? ""} ${i.school}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [items, q, levels, schools, sources]);

  const reset = () => {
    setQ("");
    setLevels(new Set());
    setSchools(new Set());
    setSources(new Set());
  };

  const activeFilterCount =
    levels.size + schools.size + sources.size + (q ? 1 : 0);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside
        className={`${
          filtersOpen ? "block" : "hidden"
        } space-y-5 rounded-xl border border-border/60 bg-card/40 p-5 lg:block`}
      >
        <div>
          <label
            htmlFor="spell-q"
            className="text-xs uppercase tracking-widest text-muted-foreground"
          >
            Поиск
          </label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="spell-q"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="по названию или школе"
              className="w-full rounded-md border border-border/60 bg-background/40 py-1.5 pl-8 pr-2 text-sm outline-none focus:border-primary/60"
            />
          </div>
        </div>

        <FilterGroup<number>
          title="Уровень"
          options={allLevels}
          selected={levels}
          onChange={setLevels}
          formatLabel={LEVEL_LABEL}
        />

        <FilterGroup<string>
          title="Школа"
          options={allSchools}
          selected={schools}
          onChange={setSchools}
        />

        <FilterGroup<string>
          title="Источник"
          options={allSources}
          selected={sources}
          onChange={setSources}
        />

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <X className="size-3" /> Сбросить ({activeFilterCount})
          </button>
        ) : null}
      </aside>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {filtered.length} из {items.length}
          </p>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-3 py-1.5 text-xs lg:hidden"
          >
            <Filter className="size-3.5" /> Фильтры
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
          {filtered.map((s) => (
            <li key={s.url}>
              <Link
                href={`/library/spells/${s.url}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {s.name.rus}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {LEVEL_LABEL(s.level)} · {s.school}
                    {s.ritual ? " · ритуал" : ""}
                    {s.concentration ? " · концентрация" : ""}
                  </span>
                </span>
                <span className="hidden shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
                  {s.source?.name?.label}
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

function FilterGroup<T extends string | number>({
  title,
  options,
  selected,
  onChange,
  formatLabel,
}: {
  title: string;
  options: T[];
  selected: Set<T>;
  onChange: (next: Set<T>) => void;
  formatLabel?: (v: T) => string;
}) {
  if (!options.length) return null;
  const toggle = (opt: T) => {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange(next);
  };
  return (
    <div>
      <p className="mb-1.5 text-xs uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.has(opt);
          return (
            <button
              key={String(opt)}
              type="button"
              onClick={() => toggle(opt)}
              className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {formatLabel ? formatLabel(opt) : String(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
