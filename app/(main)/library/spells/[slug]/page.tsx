import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDetail,
  stripTtgMarkup,
  type TtgSpellDetail,
} from "@/lib/reference/ttg-client";

type Params = Promise<{ slug: string }>;

export const revalidate = 604800; // 7 days

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getDetail<TtgSpellDetail>("spells", slug).catch(() => null);
  return { title: s?.name.rus ? `${s.name.rus} · Заклинание` : "Заклинание" };
}

export default async function SpellDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  let s: TtgSpellDetail | null = null;
  try {
    s = await getDetail<TtgSpellDetail>("spells", slug);
  } catch {
    s = null;
  }
  if (!s) return notFound();

  const components: string[] = [];
  if (s.components?.v) components.push("В");
  if (s.components?.s) components.push("С");
  if (s.components?.m) components.push("М");

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        /{" "}
        <Link href="/library/spells" className="hover:underline">
          Заклинания
        </Link>
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        {s.name.rus}
      </h1>
      {s.name.eng ? (
        <p className="mt-1 text-sm text-muted-foreground">{s.name.eng}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{s.level === 0 ? "Заговор" : `Уровень ${s.level}`}</Badge>
        <Badge>{s.school}</Badge>
        {s.ritual ? <Badge>Ритуал</Badge> : null}
        {s.concentration ? <Badge>Концентрация</Badge> : null}
      </div>

      <dl className="mt-6 grid gap-2 sm:grid-cols-2">
        <DescItem term="Время накладывания">{s.castingTime}</DescItem>
        <DescItem term="Дистанция">{s.range}</DescItem>
        <DescItem term="Длительность">{s.duration}</DescItem>
        <DescItem term="Компоненты">
          {components.length ? components.join(" / ") : "—"}
        </DescItem>
      </dl>

      {s.description?.length ? (
        <div className="mt-6 space-y-3 text-base leading-relaxed">
          {s.description.map((p, i) => (
            <p key={i}>{stripTtgMarkup(p)}</p>
          ))}
        </div>
      ) : null}

      {s.upper?.length ? (
        <div className="mt-6 rounded-xl border border-primary/40 bg-primary/5 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
            На более высоких уровнях
          </p>
          {s.upper.map((p, i) => (
            <p key={i} className="text-sm">
              {stripTtgMarkup(p)}
            </p>
          ))}
        </div>
      ) : null}

      {s.affiliation?.classes?.length ? (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Доступно классам
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {s.affiliation.classes.map((c) => (
              <Badge key={c.url}>{c.name}</Badge>
            ))}
          </div>
        </div>
      ) : null}

      {s.source?.name?.rus ? (
        <p className="mt-10 text-xs text-muted-foreground">
          Источник: {s.source.name.rus}
          {s.source.page ? `, стр. ${s.source.page}` : ""}
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-xs">
      {children}
    </span>
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
    <div className="flex gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-2">
      <dt className="min-w-[140px] text-xs uppercase tracking-wider text-muted-foreground">
        {term}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
