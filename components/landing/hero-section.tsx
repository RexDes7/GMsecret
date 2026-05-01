"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ru } from "@/lib/i18n/ru";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const t = ru.hero;
  const [ended, setEnded] = React.useState(false);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate -mt-20 flex min-h-screen w-full flex-col justify-center overflow-hidden sm:-mt-24"
    >
      {/* Hero artwork. The mp4 plays once on page load, then `onEnded`
          swaps in the still poster — same composition as the last
          frame, so the user sees the warrior freeze in place. */}
      <div className="absolute inset-0 -z-20">
        <video
          // ?v=2 busts old browser caches that picked up an earlier
          // re-encode of this file. Bump on any new mp4.
          src="/media/hero.mp4?v=2"
          // Honour `prefers-reduced-motion`: don't autoplay and don't
          // preload the file at all — those users only ever see the
          // still poster, so downloading the mp4 wastes bandwidth and
          // battery.
          autoPlay={!prefersReducedMotion}
          muted
          playsInline
          preload={prefersReducedMotion ? "none" : "auto"}
          aria-hidden
          onEnded={() => setEnded(true)}
          className="pointer-events-none h-full w-full object-cover"
          style={{
            opacity: ended || prefersReducedMotion ? 0 : 1,
            transition: "opacity 400ms ease-out",
          }}
        />
        <Image
          src="/media/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            opacity: ended || prefersReducedMotion ? 1 : 0,
            transition: "opacity 400ms ease-out",
          }}
        />
      </div>
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
