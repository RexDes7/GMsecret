import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Sword,
  Users,
  BookOpen,
  ScrollText,
  Flame,
  Shield,
  Skull,
} from "lucide-react";
import { ru } from "@/lib/i18n/ru";
import { LIBRARY_CATEGORIES } from "@/lib/data/library";

export const metadata: Metadata = { title: ru.library.title };

// Reference catalogues backed by the live ttg.club API. Each entry maps to
// a dedicated /library/<slug> route that fetches the upstream list with a
// server-side cache (see lib/reference/ttg-client.ts).
const REFERENCE_CATALOGUES: {
  slug: string;
  title: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  ready: boolean;
}[] = [
  {
    slug: "classes",
    title: "Классы",
    summary: "Воин, маг, жрец и другие — особенности, архетипы и снаряжение.",
    icon: Shield,
    ready: true,
  },
  {
    slug: "spells",
    title: "Заклинания",
    summary: "Полный каталог заклинаний D&D 5e: уровни, школы, классы.",
    icon: Sparkles,
    ready: true,
  },
  {
    slug: "magic-items",
    title: "Магические предметы",
    summary: "Артефакты, оружие и снаряжение с особыми свойствами.",
    icon: Sword,
    ready: true,
  },
  {
    slug: "species",
    title: "Виды и расы",
    summary: "Особенности рас, языки, бонусы характеристик и подвиды.",
    icon: Users,
    ready: true,
  },
  {
    slug: "feats",
    title: "Черты",
    summary: "Особенности персонажа и связанные с ними бонусы.",
    icon: Flame,
    ready: true,
  },
  {
    slug: "backgrounds",
    title: "Предыстории",
    summary: "Жизнь до приключений: умения, снаряжение, особенности.",
    icon: ScrollText,
    ready: true,
  },
  {
    slug: "bestiary",
    title: "Бестиарий",
    summary: "Существа: характеристики, действия, опасность.",
    icon: Skull,
    ready: true,
  },
];

export default function LibraryHubPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">
          {ru.library.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{ru.library.subtitle}</p>
      </header>

      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Справочник
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REFERENCE_CATALOGUES.map((c) => {
            const Icon = c.icon;
            const inner = (
              <>
                <div className="mb-3 flex items-center gap-3">
                  <Icon className="size-5 text-primary" />
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
                    {c.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">{c.summary}</p>
                <p className="mt-3 text-xs text-primary">
                  {c.ready ? "Открыть каталог →" : "Скоро →"}
                </p>
              </>
            );
            const cls =
              "group rounded-xl border border-border/60 bg-card/40 p-5 transition-colors";
            return c.ready ? (
              <Link
                key={c.slug}
                href={`/library/${c.slug}`}
                className={`${cls} hover:border-primary/40`}
              >
                {inner}
              </Link>
            ) : (
              <div
                key={c.slug}
                className={`${cls} opacity-50`}
                aria-disabled="true"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          <BookOpen className="size-4" /> Краткие выжимки
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIBRARY_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/library/${c.slug}`}
              className="group rounded-xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/40"
            >
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold">
                {c.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.summary}</p>
              <p className="mt-3 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Открыть →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
