import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDetail } from "@/lib/reference/ttg-client";
import { RichDescription } from "@/components/reference/rich-description";

type Params = Promise<{ slug: string }>;
export const revalidate = 604800;

type SpeciesFeature = {
  url?: string;
  name?: { rus?: string; eng?: string };
  description?: unknown[];
};

type SpeciesDetail = {
  url: string;
  name: { rus: string; eng?: string };
  description?: unknown[];
  image?: string;
  gallery?: string[];
  features?: SpeciesFeature[];
  properties?: Record<string, unknown>;
  source?: { name?: { rus?: string; label?: string }; page?: number };
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const it = await getDetail<SpeciesDetail>("species", slug).catch(() => null);
  return {
    title: it?.name.rus ? `${it.name.rus} · Вид` : "Вид",
  };
}

function abs(url: string) {
  return url.startsWith("http") ? url : `https://new.ttg.club${url}`;
}

export default async function SpeciesDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const it = await getDetail<SpeciesDetail>("species", slug).catch(() => null);
  if (!it) return notFound();

  const heroImg = it.gallery?.[0] || it.image;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        /{" "}
        <Link href="/library/species" className="hover:underline">
          Виды и расы
        </Link>
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        {it.name.rus}
      </h1>
      {it.name.eng ? (
        <p className="mt-1 text-sm text-muted-foreground">{it.name.eng}</p>
      ) : null}

      {heroImg ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={abs(heroImg)}
            alt={it.name.rus}
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}

      <RichDescription
        content={it.description}
        className="mt-6 space-y-3 text-base leading-relaxed"
      />

      {it.features?.length ? (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Особенности
          </h2>
          <div className="space-y-4">
            {it.features.map((f, i) => (
              <div
                key={f.url ?? i}
                className="rounded-xl border border-border/60 bg-card/40 p-4"
              >
                <p className="font-semibold">
                  {f.name?.rus ?? f.url ?? "Особенность"}
                </p>
                {f.name?.eng ? (
                  <p className="text-xs text-muted-foreground">{f.name.eng}</p>
                ) : null}
                <RichDescription
                  content={f.description}
                  className="mt-2 space-y-2 text-sm"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

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
