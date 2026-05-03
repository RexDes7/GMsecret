import Link from "next/link";
import type { ContentRecord } from "@/lib/schemas/content";
import { CONTENT_TYPE_LABEL_RU } from "@/components/content/labels";
import {
  ABILITY_KEYS,
  ABILITY_LABEL_RU,
  abilityModifier,
} from "@/lib/services/abilities";
import { MapPreview } from "@/components/content/map-preview";

/**
 * Single source of truth for rendering a content record. Used by:
 *  - The full page route `app/(main)/content/[id]/page.tsx` (SSR, share link)
 *  - The modal preview overlaid on community/profile (`?content=<id>`)
 *
 * The `as` prop controls the heading element so the modal can use h2 while
 * the standalone page keeps h1 for SEO.
 */
export function ContentDetailView({
  c,
  headingAs: H = "h1",
}: {
  c: ContentRecord;
  headingAs?: "h1" | "h2";
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        {CONTENT_TYPE_LABEL_RU[c.type]}
      </p>
      <H className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
        {c.title}
      </H>
      <p className="text-sm text-muted-foreground">
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
        <p className="text-base text-foreground/90">{c.description}</p>
      ) : null}

      <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
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
          <MapView data={c.data} />
        ) : null}
      </div>

      {c.tags.length ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {c.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ───────────────────────────────────────────────────── Character

function CharacterView({
  data,
}: {
  data: Extract<ContentRecord, { type: "character" }>["data"];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge>{data.race}</Badge>
        <Badge>{data.class}</Badge>
        <Badge>Уровень {data.level}</Badge>
      </div>
      {data.portraitUrl ? (
        <div className="relative aspect-[3/4] max-w-xs overflow-hidden rounded-xl">
          {/* User-controlled URL (any host); see content-card.tsx note. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.portraitUrl}
            alt={data.name}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ABILITY_KEYS.map((k) => {
          const m = abilityModifier(data.abilityScores[k]);
          return (
            <div
              key={k}
              className="rounded-lg border border-border/60 bg-background/40 p-3 text-center"
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {ABILITY_LABEL_RU[k]}
              </p>
              <p className="text-xl font-semibold">{data.abilityScores[k]}</p>
              <p className="text-xs text-primary">
                {m >= 0 ? `+${m}` : m}
              </p>
            </div>
          );
        })}
      </div>
      {data.background ? (
        <Section title="Биография">
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {data.background}
          </p>
        </Section>
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

// ───────────────────────────────────────────────────── Item

function ItemView({
  data,
}: {
  data: Extract<ContentRecord, { type: "item" }>["data"];
}) {
  return (
    <div className="space-y-4 text-sm">
      {data.imageUrl ? (
        <div className="relative aspect-[16/10] max-w-xl overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.imageUrl}
            alt={data.name}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Badge>{data.type}</Badge>
        <Badge>Редкость: {data.rarity}</Badge>
        <Badge>Вес: {data.weight}</Badge>
        <Badge>Стоимость: {data.cost} зм</Badge>
      </div>
      {data.description ? <p>{data.description}</p> : null}
      {data.magicalEffects ? (
        <Section title="Магические эффекты">
          <p className="text-primary/90">{data.magicalEffects}</p>
        </Section>
      ) : null}
    </div>
  );
}

// ───────────────────────────────────────────────────── Spell

function SpellView({
  data,
}: {
  data: Extract<ContentRecord, { type: "spell" }>["data"];
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{data.level === 0 ? "Заговор" : `Уровень ${data.level}`}</Badge>
        <Badge>{data.school}</Badge>
        {data.ritual ? <Badge>Ритуал</Badge> : null}
        {data.concentration ? <Badge>Концентрация</Badge> : null}
      </div>
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <DescItem term="Время накладывания">{data.castingTime}</DescItem>
        <DescItem term="Дистанция">{data.range}</DescItem>
        <DescItem term="Длительность">{data.duration}</DescItem>
        <DescItem term="Компоненты">{data.components.join(" / ")}</DescItem>
      </dl>
      {data.description ? <p>{data.description}</p> : null}
    </div>
  );
}

// ───────────────────────────────────────────────────── Artifact

function ArtifactView({
  data,
}: {
  data: Extract<ContentRecord, { type: "artifact" }>["data"];
}) {
  return (
    <div className="space-y-4 text-sm">
      {data.imageUrl ? (
        <div className="relative aspect-[16/10] max-w-xl overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.imageUrl}
            alt={data.name}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ) : null}
      {data.origin ? (
        <p className="text-muted-foreground">Происхождение: {data.origin}</p>
      ) : null}
      {data.description ? <p>{data.description}</p> : null}
      {data.powers.length ? (
        <Section title="Способности">
          <ul className="list-disc space-y-1 pl-5">
            {data.powers.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Section>
      ) : null}
      {data.curses.length ? (
        <Section title="Проклятия">
          <ul className="list-disc space-y-1 pl-5 text-destructive/80">
            {data.curses.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}

// ───────────────────────────────────────────────────── Creature

function CreatureView({
  data,
}: {
  data: Extract<ContentRecord, { type: "creature" }>["data"];
}) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{data.size}</Badge>
        <Badge>{data.type}</Badge>
        {data.alignment ? <Badge>{data.alignment}</Badge> : null}
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

// ───────────────────────────────────────────────────── Map

function MapView({
  data,
}: {
  data: Extract<ContentRecord, { type: "map" }>["data"];
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>
          {data.width}×{data.height}
        </Badge>
        <Badge>{data.markers.length} меток</Badge>
        <Badge>{(data.objects ?? []).length} объектов</Badge>
      </div>
      <MapPreview data={data} />
    </div>
  );
}

// ───────────────────────────────────────────────────── Helpers

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-foreground/80">
        {title}
      </h3>
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

function DescItem({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 rounded-md border border-border/60 bg-background/40 p-2">
      <dt className="min-w-[140px] text-xs uppercase tracking-wider text-muted-foreground">
        {term}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
