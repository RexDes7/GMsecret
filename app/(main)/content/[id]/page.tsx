import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ContentRecord } from "@/lib/schemas/content";
import { contentRepository } from "@/lib/db";
import { CONTENT_TYPE_LABEL_RU } from "@/components/content/labels";
import {
  ABILITY_KEYS,
  ABILITY_LABEL_RU,
  abilityModifier,
} from "@/lib/services/abilities";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const c = await contentRepository().get(id);
  return { title: c?.title ?? "Не найдено" };
}

export default async function ContentDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const c = await contentRepository().get(id);
  if (!c || !c.isPublic) return notFound();

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        {CONTENT_TYPE_LABEL_RU[c.type]}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        {c.title}
      </h1>
      <p className="mt-2 text-muted-foreground">
        автор:{" "}
        <Link
          href={`/profile/${c.authorUsername}`}
          className="text-primary hover:underline"
        >
          {c.authorUsername}
        </Link>{" "}
        · {new Date(c.createdAt).toLocaleDateString("ru-RU")} · просмотров:{" "}
        {c.views}
      </p>

      {c.description ? (
        <p className="mt-4 text-base text-foreground/90">{c.description}</p>
      ) : null}

      <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-6">
        {c.type === "character" ? (
          <CharacterView data={c.data} />
        ) : c.type === "item" ? (
          <ItemView data={c.data} />
        ) : c.type === "spell" ? (
          <SpellView data={c.data} />
        ) : c.type === "creature" ? (
          <CreatureView data={c.data} />
        ) : c.type === "artifact" ? (
          <ArtifactView data={c.data} />
        ) : c.type === "map" ? (
          <p className="text-sm text-muted-foreground">
            Карта {c.data.width}×{c.data.height} · {c.data.markers.length}{" "}
            маркеров. Просмотр карты будет реализован после интеграции рендера
            сетки.
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {c.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
          >
            #{t}
          </span>
        ))}
      </div>
    </article>
  );
}

function CharacterView({
  data,
}: {
  data: Extract<ContentRecord, { type: "character" }>["data"];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Badge>{data.race}</Badge>
        <Badge>{data.class}</Badge>
        <Badge>Уровень {data.level}</Badge>
      </div>
      {data.portraitUrl ? (
        <div className="relative aspect-[3/4] max-w-xs overflow-hidden rounded-xl">
          {/* User-controlled URL — see content-card.tsx note. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.portraitUrl}
            alt={data.name}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ABILITY_KEYS.map((k) => (
          <div
            key={k}
            className="rounded-lg border border-border/60 bg-background/40 p-3 text-center"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {ABILITY_LABEL_RU[k]}
            </p>
            <p className="text-xl font-semibold">{data.abilityScores[k]}</p>
            <p className="text-xs text-primary">
              {(() => {
                const m = abilityModifier(data.abilityScores[k]);
                return m >= 0 ? `+${m}` : m;
              })()}
            </p>
          </div>
        ))}
      </div>
      {data.background ? (
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {data.background}
        </p>
      ) : null}
      {data.skills.length ? (
        <Section title="Навыки">{data.skills.join(", ")}</Section>
      ) : null}
      {data.equipment.length ? (
        <Section title="Снаряжение">{data.equipment.join(", ")}</Section>
      ) : null}
      {data.spells.length ? (
        <Section title="Заклинания">{data.spells.join(", ")}</Section>
      ) : null}
    </div>
  );
}

function ItemView({
  data,
}: {
  data: Extract<ContentRecord, { type: "item" }>["data"];
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{data.type}</Badge>
        <Badge>Редкость: {data.rarity}</Badge>
        <Badge>Вес: {data.weight}</Badge>
        <Badge>Стоимость: {data.cost} зм</Badge>
      </div>
      {data.description ? <p>{data.description}</p> : null}
      {data.magicalEffects ? (
        <p className="text-primary/90">{data.magicalEffects}</p>
      ) : null}
    </div>
  );
}

function SpellView({
  data,
}: {
  data: Extract<ContentRecord, { type: "spell" }>["data"];
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>Уровень {data.level}</Badge>
        <Badge>{data.school}</Badge>
        <Badge>{data.castingTime}</Badge>
        <Badge>{data.range}</Badge>
        <Badge>{data.duration}</Badge>
        <Badge>Компоненты: {data.components.join(" ")}</Badge>
      </div>
      <p>{data.description}</p>
    </div>
  );
}

function ArtifactView({
  data,
}: {
  data: Extract<ContentRecord, { type: "artifact" }>["data"];
}) {
  return (
    <div className="space-y-3 text-sm">
      {data.origin ? (
        <p className="text-muted-foreground">Происхождение: {data.origin}</p>
      ) : null}
      <p>{data.description}</p>
      {data.powers.length ? (
        <Section title="Способности">
          <ul className="list-disc pl-5">
            {data.powers.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Section>
      ) : null}
      {data.curses.length ? (
        <Section title="Проклятия">
          <ul className="list-disc pl-5 text-destructive/80">
            {data.curses.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}

function CreatureView({
  data,
}: {
  data: Extract<ContentRecord, { type: "creature" }>["data"];
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{data.size}</Badge>
        <Badge>{data.type}</Badge>
        <Badge>УО: {data.cr}</Badge>
        <Badge>HP: {data.hp}</Badge>
        <Badge>AC: {data.ac}</Badge>
        <Badge>Скорость: {data.speed}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ABILITY_KEYS.map((k) => (
          <div
            key={k}
            className="rounded-lg border border-border/60 bg-background/40 p-2 text-center"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {ABILITY_LABEL_RU[k]}
            </p>
            <p className="text-base font-semibold">{data.abilityScores[k]}</p>
          </div>
        ))}
      </div>
      {data.description ? <p>{data.description}</p> : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}
