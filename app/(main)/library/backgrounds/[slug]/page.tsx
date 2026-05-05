import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDetail, stripTtgMarkup } from "@/lib/reference/ttg-client";
import { RichDescription } from "@/components/reference/rich-description";

type Params = Promise<{ slug: string }>;
export const revalidate = 604800;

type BackgroundDetail = {
  url: string;
  name: { rus: string; eng?: string };
  description?: unknown[];
  abilityScores?: string;
  feat?: string;
  skillProficiencies?: string;
  toolProficiency?: string[];
  equipment?: unknown[];
  source?: { name?: { rus?: string; label?: string }; page?: number };
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const it = await getDetail<BackgroundDetail>("backgrounds", slug).catch(
    () => null
  );
  return {
    title: it?.name.rus ? `${it.name.rus} · Предыстория` : "Предыстория",
  };
}

export default async function BackgroundDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const it = await getDetail<BackgroundDetail>("backgrounds", slug).catch(
    () => null
  );
  if (!it) return notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        /{" "}
        <Link href="/library/backgrounds" className="hover:underline">
          Предыстории
        </Link>
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        {it.name.rus}
      </h1>
      {it.name.eng ? (
        <p className="mt-1 text-sm text-muted-foreground">{it.name.eng}</p>
      ) : null}

      <RichDescription
        content={it.description}
        className="mt-6 space-y-3 text-base leading-relaxed"
      />

      <dl className="mt-6 grid gap-2 sm:grid-cols-2">
        {it.abilityScores ? (
          <DescItem term="Характеристики">{it.abilityScores}</DescItem>
        ) : null}
        {it.feat ? (
          <DescItem term="Черта">{stripTtgMarkup(it.feat)}</DescItem>
        ) : null}
        {it.skillProficiencies ? (
          <DescItem term="Владение навыками">
            {it.skillProficiencies}
          </DescItem>
        ) : null}
        {it.toolProficiency?.length ? (
          <DescItem term="Владение инструментами">
            {it.toolProficiency
              .map((t) => stripTtgMarkup(t))
              .join("; ")}
          </DescItem>
        ) : null}
      </dl>

      {it.equipment?.length ? (
        <section className="mt-6 rounded-xl border border-border/60 bg-card/40 p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Снаряжение
          </h2>
          <RichDescription
            content={it.equipment}
            className="space-y-2 text-sm"
          />
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

function DescItem({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 px-3 py-2">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {term}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}
