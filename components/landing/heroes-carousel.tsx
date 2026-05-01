"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ru } from "@/lib/i18n/ru";

export type HeroSlide = {
  id: string;
  name: string;
  author: string;
  image: string;
  href: string;
  subtitle: string;
};

const FALLBACK_HEROES: HeroSlide[] = [
  {
    id: "sorceress",
    name: "Селена Полночная",
    author: "@nightweave",
    image: "/media/heroes/sorceress.png",
    href: "/community?character=sorceress",
    subtitle: "Чародейка, повелительница теней",
  },
  {
    id: "legolas",
    name: "Леголас",
    author: "@elven_ranger",
    image: "/media/heroes/legolas.png",
    href: "/community?character=legolas",
    subtitle: "Эльф-следопыт, лучник долины",
  },
  {
    id: "dwarf",
    name: "Торгрим",
    author: "@runeforger",
    image: "/media/heroes/dwarf.png",
    href: "/community?character=dwarf",
    subtitle: "Дварф-воин, мастер кузнечного дела",
  },
];

const ROTATE_MS = 5500;

function modIndex(i: number, n: number) {
  return ((i % n) + n) % n;
}

/**
 * Three-up hero spotlight. The center portrait is the active hero and
 * shows a name pill at the top; the side portraits are dimmed previews of
 * the previous/next heroes. Auto-rotates every ROTATE_MS, pauses on
 * hover/focus, and supports manual prev/next + arrow keys.
 *
 * Property: `index` always satisfies `0 <= index < slides.length`.
 */
export function HeroesCarousel({
  slides = FALLBACK_HEROES,
}: {
  slides?: HeroSlide[];
}) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [paused, setPaused] = React.useState(false);

  const total = slides.length;
  const next = React.useCallback(() => {
    setDirection(1);
    setIndex((i) => modIndex(i + 1, total));
  }, [total]);
  const prev = React.useCallback(() => {
    setDirection(-1);
    setIndex((i) => modIndex(i - 1, total));
  }, [total]);
  const goTo = React.useCallback(
    (target: number) =>
      setIndex((i) => {
        setDirection(target >= i ? 1 : -1);
        return modIndex(target, total);
      }),
    [total]
  );

  React.useEffect(() => {
    if (paused || prefersReducedMotion || total <= 1) return;
    const id = window.setInterval(next, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, prefersReducedMotion, next, total]);

  if (total === 0) return null;

  const center = slides[modIndex(index, total)]!;
  const left = slides[modIndex(index - 1, total)]!;
  const right = slides[modIndex(index + 1, total)]!;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ru.heroes.section}
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <header className="mb-10 flex items-center justify-center">
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase tracking-[0.22em] sm:text-3xl">
          {ru.heroes.section}
        </h2>
      </header>

      <div className="relative">
        {/* Sliding viewport. We keep an invisible sizer grid in the normal
            flow so the absolute-positioned animated rows always have a
            stable height, and clip exiting/entering rows on the x-axis
            only (`overflow-x-clip`) so the centered name pill that sits
            above the active card and any soft drop shadows below stay
            fully visible. */}
        <div className="relative overflow-x-clip overflow-y-visible py-6">
          <div
            aria-hidden
            className="invisible grid grid-cols-3 items-center gap-3 sm:gap-5"
          >
            <div className="aspect-[3/4]" />
            <div className="aspect-[3/4]" />
            <div className="aspect-[3/4]" />
          </div>
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={index}
              custom={direction}
              variants={{
                enter: (d: number) => ({
                  x: d > 0 ? "100%" : "-100%",
                  opacity: 0,
                }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({
                  x: d > 0 ? "-100%" : "100%",
                  opacity: 0,
                }),
              }}
              initial={prefersReducedMotion ? false : "enter"}
              animate="center"
              exit={prefersReducedMotion ? undefined : "exit"}
              transition={{
                x: { type: "spring", stiffness: 220, damping: 30 },
                opacity: { duration: 0.25 },
              }}
              className="absolute inset-0 grid grid-cols-3 items-center gap-3 sm:gap-5"
            >
              <HeroCard
                slide={left}
                variant="side"
                onClick={prev}
                ariaLabel="Предыдущий герой"
              />
              <HeroCard
                slide={center}
                variant="center"
                ariaLabel={`Открыть карточку ${center.name}`}
              />
              <HeroCard
                slide={right}
                variant="side"
                onClick={next}
                ariaLabel="Следующий герой"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Big chevron buttons — overlay on the edges. */}
        <div className="pointer-events-none absolute inset-y-0 -inset-x-2 z-10 hidden items-center justify-between sm:flex">
          <button
            type="button"
            aria-label="Предыдущий герой"
            onClick={prev}
            className="pointer-events-auto grid size-11 place-items-center rounded-full bg-black/35 text-foreground/70 ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-black/55 hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Следующий герой"
            onClick={next}
            className="pointer-events-auto grid size-11 place-items-center rounded-full bg-black/35 text-foreground/70 ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-black/55 hover:text-foreground"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Перейти к ${s.name}`}
            aria-current={i === modIndex(index, total)}
            onClick={() => goTo(i)}
            className={
              i === modIndex(index, total)
                ? "h-1.5 w-6 rounded-full bg-foreground transition-all"
                : "h-1.5 w-1.5 rounded-full bg-muted transition-all hover:bg-muted-foreground"
            }
          />
        ))}
      </div>

      {/* SR-only description of the active hero so screen readers track
          changes even though the visual UI just shows the portrait. */}
      <p className="sr-only" aria-live="polite">
        {center.name}: {center.subtitle}, автор {center.author}.
      </p>
    </section>
  );
}

type HeroCardProps = {
  slide: HeroSlide;
  variant: "center" | "side";
  ariaLabel: string;
  onClick?: () => void;
};

function HeroCard({ slide, variant, ariaLabel, onClick }: HeroCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isCenter = variant === "center";

  const inner = (
    <motion.div
      key={slide.id + variant}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={
        isCenter
          ? "relative aspect-[3/4] w-full rounded-2xl"
          : "relative aspect-[3/4] w-full overflow-hidden rounded-2xl"
      }
    >
      <div
        className={
          isCenter
            ? "relative size-full overflow-hidden rounded-2xl ring-2 ring-foreground/15"
            : "absolute inset-0 overflow-hidden rounded-2xl"
        }
      >
        <Image
          src={slide.image}
          alt={slide.name}
          fill
          sizes={
            isCenter
              ? "(min-width: 768px) 30vw, 50vw"
              : "(min-width: 768px) 22vw, 25vw"
          }
          className={
            isCenter
              ? "object-cover"
              : "object-cover opacity-55 saturate-50 transition-opacity hover:opacity-80"
          }
          priority={isCenter}
        />
        {/* Side portraits get an inward fade so the focus stays on the
            center portrait. */}
        {!isCenter ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-background/45 via-transparent to-background/45"
          />
        ) : null}
      </div>

      {isCenter ? (
        <div className="absolute inset-x-0 -top-4 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#7a1424] px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-foreground shadow-[0_8px_20px_-6px_rgba(220,28,52,0.6)] ring-1 ring-white/15">
            {slide.name}
            <span aria-hidden>⚔</span>
          </span>
        </div>
      ) : null}
    </motion.div>
  );

  if (isCenter) {
    return (
      <Link
        href={slide.href}
        aria-label={ariaLabel}
        className="block focus-visible:outline-none"
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="block w-full cursor-pointer focus-visible:outline-none"
    >
      {inner}
    </button>
  );
}
