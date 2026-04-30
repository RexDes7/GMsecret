"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const t = ru.hero;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[88vh] w-full flex-col items-center justify-center overflow-hidden"
    >
      {/* Background video */}
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
      {/* Gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_55%,rgba(0,0,0,0.95)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent"
      />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
      >
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          {t.eyebrow}
        </span>
        <h1
          id="hero-heading"
          className="text-balance font-[family-name:var(--font-heading)] text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl"
        >
          {t.title}
        </h1>
        <p className="mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          {t.subtitle}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="glow-primary px-6">
            <Link href="/register">{t.ctaPrimary}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-6">
            <Link href="/library">{t.ctaSecondary}</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
