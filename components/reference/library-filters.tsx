"use client";

/**
 * Reusable filter primitives shared across the /library/* reference pages.
 * Keeps the pill-button + sidebar layout consistent.
 */
import { Search, Filter, X } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder = "поиск",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border/60 bg-background/40 py-1.5 pl-8 pr-2 text-sm outline-none focus:border-primary/60"
      />
    </div>
  );
}

export function FilterGroup<T extends string | number>({
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

export function FiltersToggle({
  open,
  onToggle,
  count,
}: {
  open: boolean;
  onToggle: () => void;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-3 py-1.5 text-xs lg:hidden"
      aria-expanded={open}
    >
      <Filter className="size-3.5" /> Фильтры
      {count > 0 ? (
        <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function ResetButton({
  count,
  onReset,
}: {
  count: number;
  onReset: () => void;
}) {
  if (count === 0) return null;
  return (
    <button
      type="button"
      onClick={onReset}
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      <X className="size-3" /> Сбросить ({count})
    </button>
  );
}
