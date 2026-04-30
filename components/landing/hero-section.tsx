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
              className="inline-flex items-center justify-center rounded-full bg-foreground px-8 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-background shadow-[0_10px_30px_-10px_rgba(255,255,255,0.45)] transition-transform hover:-translate-y-0.5"
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-full border border-foreground/35 bg-black/40 px-8 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-foreground/95 backdrop-blur transition-colors hover:border-foreground/70"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
