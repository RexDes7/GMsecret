import type { Metadata } from "next";
import Link from "next/link";
import { ru } from "@/lib/i18n/ru";
import { LIBRARY_CATEGORIES } from "@/lib/data/library";

export const metadata: Metadata = { title: ru.library.title };

export default function LibraryHubPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">
          {ru.library.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{ru.library.subtitle}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LIBRARY_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/library/${c.slug}`}
            className="group rounded-xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/40"
          >
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
              {c.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.summary}</p>
            <p className="mt-3 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Открыть →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
