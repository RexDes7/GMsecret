"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ru } from "@/lib/i18n/ru";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const t = ru.hero;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-screen w-full flex-col justify-center overflow-hidden"
    >
      {/* Background video covers the whole hero. We render it behind
          everything; on `prefers-reduced-motion` it stays paused on the
          poster frame so the still image still reads as the warrior. */}
      <video
        className="absolute inset-0 -z-20 size-full object-cover"
        src="/media/hero.mp4"
        poster="/media/hero-poster.jpg"
        autoPlay={!prefersReducedMotion}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      {/* Two stacked overlays:
          - Left-side dark fade so the text stays legible without
            tinting the warrior on the right
          - Bottom fade-to-background so the next section blends in */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,3,5,0.85)_0%,rgba(8,3,5,0.55)_30%,rgba(8,3,5,0.05)_55%,rgba(8,3,5,0)_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-2xl"
        >
          <h1
            id="hero-heading"
            className="text-balance font-[family-name:var(--font-heading)] text-4xl font-bold uppercase leading-[1.02] tracking-[0.005em] sm:text-6xl md:text-[4.5rem]"
          >
            {t.title}
          </h1>
          <p className="mt-7 max-w-md text-balance text-base leading-relaxed text-foreground/80 sm:text-lg">
            {t.subtitle}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-10 py-3.5 text-sm font-semibold uppercase tracking-[0.24em] text-background shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-full border border-foreground/30 bg-black/40 px-10 py-3.5 text-sm font-semibold uppercase tracking-[0.24em] text-foreground/95 backdrop-blur transition-colors hover:border-foreground/70"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
