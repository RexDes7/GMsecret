"use client";

import * as React from "react";
import Link from "next/link";
import {
  FilterGroup,
  FiltersToggle,
  ResetButton,
  SearchInput,
} from "@/components/reference/library-filters";
import type { TtgMagicItemListItem } from "@/lib/reference/ttg-client";

// Approximate ttg.club ordering by power. Items with rarities outside this
// list keep their natural lexical position.
const RARITY_ORDER = [
  "обычная",
  "необычная",
  "редкая",
  "очень редкая",
  "легендарная",
  "артефакт",
];

function rarityRank(r: string): number {
  const lr = r.toLowerCase();
  const idx = RARITY_ORDER.findIndex((token) => lr.includes(token));
  return idx === -1 ? RARITY_ORDER.length : idx;
}

export function MagicItemsLibraryClient({
  items,
}: {
  items: TtgMagicItemListItem[];
}) {
  const [q, setQ] = React.useState("");
  const [rarities, setRarities] = React.useState<Set<string>>(new Set());
  const [sources, setSources] = React.useState<Set<string>>(new Set());
  const [needsAttunement, setNeedsAttunement] = React.useState<
    "all" | "yes" | "no"
  >("all");
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const allRarities = React.useMemo(
    () =>
      Array.from(new Set(items.map((i) => i.rarity)))
        .sort(
          (a, b) =>
            rarityRank(a) - rarityRank(b) || a.localeCompare(b, "ru")
        ),
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
      if (rarities.size && !rarities.has(i.rarity)) return false;
      const sourceLabel = i.source?.name?.label;
      if (sources.size && (!sourceLabel || !sources.has(sourceLabel)))
        return false;
      if (needsAttunement === "yes" && !i.attunement) return false;
      if (needsAttunement === "no" && i.attunement) return false;
      if (ql) {
        const hay = `${i.name.rus} ${i.name.eng ?? ""} ${i.rarity}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [items, q, rarities, sources, needsAttunement]);

  const reset = () => {
    setQ("");
    setRarities(new Set());
    setSources(new Set());
    setNeedsAttunement("all");
  };

  const activeFilterCount =
    rarities.size +
    sources.size +
    (q ? 1 : 0) +
    (needsAttunement !== "all" ? 1 : 0);

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
            placeholder="по названию или редкости"
          />
        </div>

        <FilterGroup<string>
          title="Редкость"
          options={allRarities}
          selected={rarities}
          onChange={setRarities}
        />

        <div>
          <p className="mb-1.5 text-xs uppercase tracking-widest text-muted-foreground">
            Настройка
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "yes", "no"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setNeedsAttunement(v)}
                className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
                  needsAttunement === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-background/40 text-muted-foreground hover:border-primary/40"
                }`}
              >
                {v === "all" ? "Все" : v === "yes" ? "Требуется" : "Без настройки"}
              </button>
            ))}
          </div>
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

        <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
          {filtered.map((it) => (
            <li key={it.url}>
              <Link
                href={`/library/magic-items/${it.url}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {it.name.rus}
                  </span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {it.rarity}
                    {it.attunement ? " · требуется настройка" : ""}
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
