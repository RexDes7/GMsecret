import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findCategory, LIBRARY_CATEGORIES } from "@/lib/data/library";

type Params = Promise<{ category: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { category } = await params;
  const c = findCategory(category);
  return { title: c?.title ?? "Не найдено" };
}

export function generateStaticParams() {
  return LIBRARY_CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function LibraryCategoryPage({
  params,
}: {
  params: Params;
}) {
  const { category } = await params;
  const c = findCategory(category);
  if (!c) return notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        Библиотека
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        {c.title}
      </h1>
      <p className="mt-2 text-muted-foreground">{c.summary}</p>

      <ul className="mt-8 divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
        {c.articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/library/${c.slug}/${a.slug}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
            >
              <span>
                <span className="block font-semibold">{a.title}</span>
                <span className="line-clamp-1 text-sm text-muted-foreground">
                  {a.body}
                </span>
              </span>
              <span className="text-primary">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
