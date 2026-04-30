import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findArticle,
  findCategory,
  LIBRARY_CATEGORIES,
} from "@/lib/data/library";

type Params = Promise<{ category: string; article: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { category, article } = await params;
  const a = findArticle(category, article);
  return { title: a?.title ?? "Не найдено" };
}

export function generateStaticParams() {
  return LIBRARY_CATEGORIES.flatMap((c) =>
    c.articles.map((a) => ({ category: c.slug, article: a.slug }))
  );
}

export default async function LibraryArticlePage({
  params,
}: {
  params: Params;
}) {
  const { category, article } = await params;
  const c = findCategory(category);
  const a = findArticle(category, article);
  if (!c || !a) return notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href={`/library/${c.slug}`}
        className="text-xs uppercase tracking-[0.2em] text-primary hover:underline"
      >
        ← {c.title}
      </Link>
      <h1 className="mt-3 font-[family-name:var(--font-heading)] text-4xl font-bold">
        {a.title}
      </h1>
      <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground/90">
        {a.body}
      </p>
    </article>
  );
}
