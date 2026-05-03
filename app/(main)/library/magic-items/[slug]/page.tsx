import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDetail } from "@/lib/reference/ttg-client";
import { RichDescription } from "@/components/reference/rich-description";

type Params = Promise<{ slug: string }>;
export const revalidate = 604800;

type MagicItemDetail = {
  url: string;
  name: { rus: string; eng?: string };
  description?: unknown[];
  subtitle?: string;
  image?: string;
  source?: { name?: { rus?: string; label?: string }; page?: number };
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const it = await getDetail<MagicItemDetail>("magic-items", slug).catch(
    () => null
  );
  return {
    title: it?.name.rus ? `${it.name.rus} · Магический предмет` : "Предмет",
  };
}

export default async function MagicItemDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const it = await getDetail<MagicItemDetail>("magic-items", slug).catch(
    () => null
  );
  if (!it) return notFound();

  const imageUrl = it.image
    ? it.image.startsWith("http")
      ? it.image
      : `https://new.ttg.club${it.image}`
    : null;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        /{" "}
        <Link href="/library/magic-items" className="hover:underline">
          Магические предметы
        </Link>
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        {it.name.rus}
      </h1>
      {it.name.eng ? (
        <p className="mt-1 text-sm text-muted-foreground">{it.name.eng}</p>
      ) : null}

      {it.subtitle ? (
        <p className="mt-3 text-sm italic text-muted-foreground">
          {it.subtitle}
        </p>
      ) : null}

      {imageUrl ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card/40">
          {/* User-served URL from ttg.club CDN; see content-card.tsx note. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={it.name.rus}
            className="h-auto w-full object-contain"
          />
        </div>
      ) : null}

      <RichDescription
        content={it.description}
        className="mt-6 space-y-3 text-base leading-relaxed"
      />

      {it.source?.name?.rus ? (
        <p className="mt-10 text-xs text-muted-foreground">
          Источник: {it.source.name.rus}
          {it.source.page ? `, стр. ${it.source.page}` : ""}
        </p>
      ) : null}
      <p className="mt-1 text-xs text-muted-foreground/80">
        Данные:{" "}
        <a
          href="https://new.ttg.club"
          target="_blank"
          rel="noreferrer noopener"
          className="hover:underline"
        >
          ttg.club
        </a>
      </p>
    </article>
  );
}
