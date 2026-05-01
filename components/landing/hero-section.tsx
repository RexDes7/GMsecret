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
      className="relative isolate -mt-20 flex min-h-screen w-full flex-col justify-center overflow-hidden sm:-mt-24"
    >
      {/* Background hero loop. Autoplays muted in a continuous loop; no
          scroll binding. The mp4 ships with `playsInline` so iOS doesn't
          take it fullscreen, and `preload="auto"` lets us start painting
          frames as soon as the first chunk lands. */}
      <video
        src="/media/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      {/* Soft left-side fade so the headline stays legible without
          tinting the warrior on the right, plus a bottom fade-to-bg
          so the next section blends in. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,3,5,0.75)_0%,rgba(8,3,5,0.4)_35%,rgba(8,3,5,0.05)_60%,rgba(8,3,5,0)_75%)]"
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
          className="relative max-w-xl"
        >
          <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.36em] text-primary/85 sm:text-xs">
            {t.eyebrow}
          </p>
          <h1
            id="hero-heading"
            className="font-[family-name:var(--font-heading)] text-[clamp(1.75rem,4.4vw,3.25rem)] font-bold uppercase leading-[1.22] tracking-[0.005em] [text-wrap:balance]"
          >
            {t.title}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-foreground/75 sm:text-base [text-wrap:pretty]">
            {t.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-foreground px-8 py-3 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-background shadow-[0_10px_30px_-10px_rgba(255,255,255,0.45)] transition-transform hover:-translate-y-0.5"
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-xl border border-foreground/35 bg-black/40 px-8 py-3 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-foreground/95 backdrop-blur transition-colors hover:border-foreground/70"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
