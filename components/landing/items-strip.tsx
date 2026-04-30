"use client";

import Link from "next/link";
import {
  Sword,
  ShieldHalf,
  FlaskConical,
  Gem,
  Skull,
  Crown,
  Wand2,
  ScrollText,
  Hammer,
  KeyRound,
  Coins,
  Flame,
  Swords,
  BookOpen,
  Axe,
  Shield,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";

type Item = {
  /** Stable id, also used as the slug fragment in the link. */
  id: string;
  /** Display name shown under the artwork. */
  name: string;
  /** Author handle (without `@`). */
  author: string;
  /** Lucide icon used as a stand-in until real artwork is available. */
  icon: React.ComponentType<{ className?: string }>;
  /** Where the card links to in the public catalogue. */
  href: string;
};

/**
 * Mock "items of the week" feed.
 *
 * The real shape will come from `GET /api/items?recent=true&limit=…` once
 * the backend lands. Each card here matches the eventual response: id,
 * display name, author handle, artwork (icon for now → replaced by
 * `imageUrl`), and a deep-link to the item on the public catalogue.
 */
const ITEMS: Item[] = [
  { id: "1", name: "Меч драконоборца", author: "elven_ranger", icon: Sword, href: "/community?type=item" },
  { id: "2", name: "Щит лунного света", author: "moonblade", icon: ShieldHalf, href: "/community?type=item" },
  { id: "3", name: "Зелье отваги", author: "alchymistress", icon: FlaskConical, href: "/community?type=item" },
  { id: "4", name: "Самоцвет Мистры", author: "weaver", icon: Gem, href: "/community?type=artifact" },
  { id: "5", name: "Череп лича", author: "necro_dm", icon: Skull, href: "/community?type=artifact" },
  { id: "6", name: "Корона Заката", author: "kingmaker", icon: Crown, href: "/community?type=artifact" },
  { id: "7", name: "Жезл стихий", author: "stormcaller", icon: Wand2, href: "/community?type=spell" },
  { id: "8", name: "Свиток молнии", author: "sparkmage", icon: ScrollText, href: "/community?type=spell" },
  { id: "9", name: "Молот Грома", author: "runeforger", icon: Hammer, href: "/community?type=item" },
  { id: "10", name: "Ключ судеб", author: "shadowstep", icon: KeyRound, href: "/community?type=item" },
  { id: "11", name: "Сокровищница", author: "treasure_master", icon: Coins, href: "/community?type=item" },
  { id: "12", name: "Огненный шар", author: "pyromancer", icon: Flame, href: "/community?type=spell" },
  { id: "13", name: "Парные клинки", author: "duelist", icon: Swords, href: "/community?type=item" },
  { id: "14", name: "Том заклинаний", author: "loremaster", icon: BookOpen, href: "/community?type=spell" },
  { id: "15", name: "Боевой топор", author: "axewielder", icon: Axe, href: "/community?type=item" },
  { id: "16", name: "Башенный щит", author: "guardian", icon: Shield, href: "/community?type=item" },
];

/**
 * One item card. The artwork sits on a deep crimson gradient with a
 * subtle inset highlight so the icon reads as a real thumbnail.
 */
function ItemCard({ item }: { item: Item }) {
  const { icon: Icon, name, author, href } = item;
  return (
    <Link
      href={href}
      aria-label={`${name} — автор @${author}`}
      className="group relative flex w-44 shrink-0 flex-col gap-2 sm:w-48"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_30%_25%,rgba(220,28,52,0.45)_0%,rgba(70,8,16,0.95)_55%,rgba(20,4,8,1)_100%)] ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:ring-primary/60">
        <Icon className="absolute inset-0 m-auto size-14 text-foreground/95 drop-shadow-[0_4px_18px_rgba(220,28,52,0.55)]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.08)_0%,transparent_38%)]"
        />
      </div>
      <div className="px-1">
        <p className="truncate text-sm font-semibold leading-tight">{name}</p>
        <p className="truncate text-xs text-muted-foreground">@{author}</p>
      </div>
    </Link>
  );
}

/**
 * Horizontal marquee of item-of-the-week cards. The track scrolls
 * left-to-right indefinitely and pauses when the user hovers the strip,
 * letting them grab any card that catches their eye.
 *
 * Reuses the global `gmsh-marquee` keyframe defined by `DndMarquee`.
 */
export function ItemsStrip() {
  const prefersReducedMotion = useReducedMotion();
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <section
      aria-label="Предметы недели"
      className="relative w-full overflow-hidden py-12"
    >
      <div className="mx-auto mb-7 flex max-w-7xl items-end justify-between px-4 sm:px-6">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase tracking-[0.16em] sm:text-3xl">
          Предметы недели
        </h2>
        <Link
          href="/community?type=item"
          className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Смотреть все →
        </Link>
      </div>

      <div
        className={
          prefersReducedMotion
            ? "flex w-max flex-nowrap items-stretch gap-5 overflow-x-auto px-4 sm:px-6"
            : "group/track flex w-max flex-nowrap items-stretch gap-5 px-4 [animation:gmsh-marquee_55s_linear_infinite] motion-reduce:[animation:none] hover:[animation-play-state:paused] sm:px-6"
        }
      >
        {doubled.map((item, i) => (
          <ItemCard key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </section>
  );
}
