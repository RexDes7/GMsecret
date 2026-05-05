import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClassDetail } from "@/lib/reference/ttg-ssr";
import { RichDescription } from "@/components/reference/rich-description";

type Params = Promise<{ slug: string }>;
export const revalidate = 604800;

function abs(url: string) {
  return url.startsWith("http") ? url : `https://new.ttg.club${url}`;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getClassDetail(slug).catch(() => null);
  return {
    title: r?.detail?.name.rus ? `${r.detail.name.rus} · Класс` : "Класс",
  };
}

export default async function ClassDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const r = await getClassDetail(slug).catch(() => null);
  if (!r?.detail) return notFound();

  const c = r.detail;
  const subclasses = r.subclasses;
  const heroImg = c.gallery?.[0] || c.image;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        /{" "}
        <Link href="/library/classes" className="hover:underline">
          Классы
        </Link>
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        {c.name.rus}
      </h1>
      {c.name.eng ? (
        <p className="mt-1 text-sm text-muted-foreground">{c.name.eng}</p>
      ) : null}

      {heroImg ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={abs(heroImg)}
            alt={c.name.rus}
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}

      <dl className="mt-6 grid gap-2 sm:grid-cols-2">
        {c.hitDice?.label ? (
          <DescItem term="Кость хитов">{c.hitDice.label}</DescItem>
        ) : null}
        {c.primaryCharacteristics ? (
          <DescItem term="Основные характеристики">
            {c.primaryCharacteristics}
          </DescItem>
        ) : null}
        {c.savingThrows ? (
          <DescItem term="Спасброски">{c.savingThrows}</DescItem>
        ) : null}
      </dl>

      <RichDescription
        content={c.description}
        className="mt-6 space-y-3 text-base leading-relaxed"
      />

      {c.equipment?.length ? (
        <section className="mt-6 rounded-xl border border-border/60 bg-card/40 p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Снаряжение
          </h2>
          <RichDescription
            content={c.equipment}
            className="space-y-2 text-sm"
          />
        </section>
      ) : null}

      {c.features?.length ? (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Особенности класса
          </h2>
          <div className="space-y-4">
            {c.features.map((f, i) => (
              <div
                key={f.key ?? i}
                className="rounded-xl border border-border/60 bg-card/40 p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold">{f.name ?? "Особенность"}</p>
                  {f.level ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {f.level} уровень
                    </span>
                  ) : null}
                </div>
                <RichDescription
                  content={f.description}
                  className="mt-2 space-y-2 text-sm"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {subclasses.length ? (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Архетипы
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {subclasses.map((s) => (
              <li key={s.url}>
                <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                  <p className="font-semibold">{s.name.rus}</p>
                  {s.name.eng ? (
                    <p className="text-xs text-muted-foreground">{s.name.eng}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.source?.name?.label}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {c.source?.name?.rus ? (
        <p className="mt-10 text-xs text-muted-foreground">
          Источник: {c.source.name.rus}
          {c.source.page ? `, стр. ${c.source.page}` : ""}
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
