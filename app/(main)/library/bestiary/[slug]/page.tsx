import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatureDetail } from "@/lib/reference/ttg-ssr";
import { RichDescription } from "@/components/reference/rich-description";

type Params = Promise<{ slug: string }>;
export const revalidate = 604800;

type Ability = { value?: number; mod?: string; sav?: string };
type CreatureDetail = {
  url: string;
  name: { rus: string; eng?: string };
  description?: unknown[];
  header?: string;
  hit?: { hit?: number; formula?: string; text?: string };
  initiative?: { label?: string; value?: string };
  speed?: string;
  abilities?: {
    str?: Ability;
    dex?: Ability;
    con?: Ability;
    int?: Ability;
    wis?: Ability;
    chr?: Ability;
  };
  skills?: { label?: string; value?: string }[];
  sense?: string;
  languages?: string;
  vulnerability?: string;
  resistance?: string;
  immunity?: string;
  traits?: { name?: { rus?: string }; description?: unknown[] }[];
  actions?: { name?: { rus?: string }; description?: unknown[] }[];
  bonusActions?: { name?: { rus?: string }; description?: unknown[] }[];
  reactions?: { name?: { rus?: string }; description?: unknown[] }[];
  legendary?: { name?: { rus?: string }; description?: unknown[] }[];
  source?: { name?: { rus?: string; label?: string }; page?: number };
};

const ABILITY_LABEL: Record<string, string> = {
  str: "Сила",
  dex: "Ловкость",
  con: "Телосложение",
  int: "Интеллект",
  wis: "Мудрость",
  chr: "Харизма",
};

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCreatureDetail(slug).catch(
    () => null
  )) as CreatureDetail | null;
  return {
    title: c?.name.rus ? `${c.name.rus} · Бестиарий` : "Существо",
  };
}

export default async function CreatureDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const c = (await getCreatureDetail(slug).catch(
    () => null
  )) as CreatureDetail | null;
  if (!c) return notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        /{" "}
        <Link href="/library/bestiary" className="hover:underline">
          Бестиарий
        </Link>
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        {c.name.rus}
      </h1>
      {c.name.eng ? (
        <p className="mt-1 text-sm text-muted-foreground">{c.name.eng}</p>
      ) : null}
      {c.header ? (
        <p className="mt-2 text-sm italic text-muted-foreground">{c.header}</p>
      ) : null}

      <div className="mt-6 grid gap-3 rounded-xl border border-border/60 bg-card/40 p-4 text-sm sm:grid-cols-3">
        {c.hit?.hit ? (
          <Stat label="Хиты">
            {c.hit.hit}
            {c.hit.formula ? ` (${c.hit.formula})` : ""}
          </Stat>
        ) : null}
        {c.initiative?.value ? (
          <Stat label="Инициатива">
            {c.initiative.value}
            {c.initiative.label ? ` (${c.initiative.label})` : ""}
          </Stat>
        ) : null}
        {c.speed ? <Stat label="Скорость">{c.speed.trim()}</Stat> : null}
      </div>

      {c.abilities ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(["str", "dex", "con", "int", "wis", "chr"] as const).map((k) => {
            const a = c.abilities?.[k];
            if (!a) return null;
            return (
              <div
                key={k}
                className="rounded-md border border-border/60 bg-background/40 px-2 py-2 text-center text-sm"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {ABILITY_LABEL[k]}
                </p>
                <p className="font-semibold">{a.value}</p>
                <p className="text-xs text-muted-foreground">
                  {a.mod}
                  {a.sav && a.sav !== a.mod ? ` / сб ${a.sav}` : ""}
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {c.skills?.length ? (
          <DescItem term="Навыки">
            {c.skills
              .map((s) => `${s.label} ${s.value}`)
              .join(", ")}
          </DescItem>
        ) : null}
        {c.sense ? <DescItem term="Чувства">{c.sense}</DescItem> : null}
        {c.languages ? (
          <DescItem term="Языки">{c.languages}</DescItem>
        ) : null}
        {c.immunity ? (
          <DescItem term="Иммунитет">{c.immunity}</DescItem>
        ) : null}
        {c.resistance ? (
          <DescItem term="Сопротивление">{c.resistance}</DescItem>
        ) : null}
        {c.vulnerability ? (
          <DescItem term="Уязвимость">{c.vulnerability}</DescItem>
        ) : null}
      </dl>

      <RichDescription
        content={c.description}
        className="mt-6 space-y-3 text-base leading-relaxed"
      />

      <FeatureSection title="Особенности" items={c.traits} />
      <FeatureSection title="Действия" items={c.actions} />
      <FeatureSection title="Бонусные действия" items={c.bonusActions} />
      <FeatureSection title="Реакции" items={c.reactions} />
      <FeatureSection title="Легендарные действия" items={c.legendary} />

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

function FeatureSection({
  title,
  items,
}: {
  title: string;
  items?: { name?: { rus?: string }; description?: unknown[] }[];
}) {
  if (!items?.length) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-card/40 p-4"
          >
            {it.name?.rus ? (
              <p className="mb-1 font-semibold">{it.name.rus}</p>
            ) : null}
            <RichDescription
              content={it.description}
              className="space-y-2 text-sm"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-semibold">{children}</p>
    </div>
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
