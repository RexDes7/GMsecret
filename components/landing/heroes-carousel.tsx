"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";

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
    id: "legolas",
    name: "Леголас Долины",
    author: "@elven_ranger",
    image: "/media/heroes/legolas.png",
    href: "/community?character=legolas",
    subtitle: "Эльф-следопыт, лучник долины",
  },
  {
    id: "dwarf",
    name: "Торгрим Каменный Молот",
    author: "@runeforger",
    image: "/media/heroes/dwarf.png",
    href: "/community?character=dwarf",
    subtitle: "Дварф-воин, мастер кузнечного дела",
  },
  {
    id: "sorceress",
    name: "Селена Полночная",
    author: "@nightweave",
    image: "/media/heroes/sorceress.png",
    href: "/community?character=sorceress",
    subtitle: "Чародейка, повелительница теней",
  },
];

const ROTATE_MS = 5000;

/**
 * Carousel of featured heroes. Auto-rotates every 5s, pauses on hover/focus,
 * and supports manual prev/next navigation.
 *
 * Property: index always satisfies 0 <= index < slides.length.
 */
export function HeroesCarousel({
  slides = FALLBACK_HEROES,
}: {
  slides?: HeroSlide[];
}) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const total = slides.length;
  const next = React.useCallback(
    () => setIndex((i) => (i + 1) % total),
    [total]
  );
  const prev = React.useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total]
  );

  React.useEffect(() => {
    if (paused || prefersReducedMotion || total <= 1) return;
    const id = window.setInterval(next, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, prefersReducedMotion, next, total]);

  const slide = slides[index];
  if (total === 0 || !slide) return null;

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
      <header className="mb-8 flex items-end justify-between">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
          {ru.heroes.section}
        </h2>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
        >
          <Link href="/community?type=character">{ru.heroes.cta}</Link>
        </Button>
      </header>

      <div className="relative grid items-center gap-6 overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 md:grid-cols-[1fr_1.2fr]">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted/40">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial={
                prefersReducedMotion ? false : { opacity: 0, scale: 1.02 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Image
                src={slide.image}
                alt={slide.name}
                fill
                sizes="(min-width: 768px) 35vw, 90vw"
                className="object-cover"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative flex min-h-[18rem] flex-col gap-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id + "-text"}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-3"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-primary">
                {String(index + 1).padStart(2, "0")} /
                {String(total).padStart(2, "0")}
              </p>
              <h3 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
                {slide.name}
              </h3>
              <p className="text-sm text-muted-foreground">{slide.subtitle}</p>
              <p className="text-xs text-muted-foreground/80">
                автор: {slide.author}
              </p>
              <Button asChild size="sm" className="mt-2 self-start">
                <Link href={slide.href}>Открыть карточку</Link>
              </Button>
            </motion.div>
          </AnimatePresence>

          <div className="mt-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Предыдущий герой"
              onClick={prev}
              className="grid size-10 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Следующий герой"
              onClick={next}
              className="grid size-10 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="ml-2 flex items-center gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Перейти к ${s.name}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={
                    i === index
                      ? "h-1.5 w-6 rounded-full bg-primary transition-all"
                      : "h-1.5 w-1.5 rounded-full bg-muted transition-all hover:bg-muted-foreground"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
