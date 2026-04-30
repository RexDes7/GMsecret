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
      className="relative isolate flex min-h-[88vh] w-full flex-col justify-center overflow-hidden"
    >
      {/* Background video (atmosphere) */}
      <video
        className="absolute inset-0 -z-30 size-full object-cover"
        src="/media/hero.mp4"
        poster="/media/hero-poster.jpg"
        autoPlay={!prefersReducedMotion}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      {/* Red gradient overlay — reads brighter on the right (where the
          warrior silhouette sits in the source video) and fades to black
          at the bottom so the next section can blend in. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_120%_90%_at_75%_45%,rgba(190,28,52,0.55)_0%,rgba(120,16,32,0.65)_38%,rgba(20,4,8,0.92)_75%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-transparent to-background"
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-2xl"
        >
          <h1
            id="hero-heading"
            className="text-balance font-[family-name:var(--font-heading)] text-4xl font-bold uppercase leading-[1.05] tracking-[0.01em] sm:text-6xl md:text-[4.25rem]"
          >
            {t.title}
          </h1>
          <p className="mt-6 max-w-md text-balance text-base leading-relaxed text-foreground/80 sm:text-lg">
            {t.subtitle}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-9 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-background shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-full border border-foreground/30 bg-black/35 px-9 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-foreground/95 backdrop-blur transition-colors hover:border-foreground/70"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
