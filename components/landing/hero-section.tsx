"use client";

import * as React from "react";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ru } from "@/lib/i18n/ru";

/** How many viewport heights the hero "pins" while the video scrubs. */
const SCRUB_VH = 120;

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const t = ru.hero;
  const sectionRef = React.useRef<HTMLElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = React.useState(0);

  // Scroll progress through the tall section: 0 when its top hits the
  // viewport top, 1 when its bottom hits the viewport bottom. While the
  // sticky child is pinned, this maps cleanly to the scrub timeline.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (prefersReducedMotion) return;
    const video = videoRef.current;
    const d = duration || video?.duration || 0;
    if (!video || !d || !Number.isFinite(d)) return;
    // Clamp slightly inside [0, d] to avoid Safari resetting to 0 at the
    // very end of the buffer.
    const target = Math.max(0, Math.min(d - 0.05, v * d));
    if (Math.abs(video.currentTime - target) > 1 / 60) {
      video.currentTime = target;
    }
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      // The outer wrapper provides scroll distance for the scrub. The
      // sticky child renders one viewport-height of art that stays
      // pinned while the user drags through it.
      className="relative isolate -mt-20 w-full sm:-mt-24"
      style={{ height: `calc(100vh + ${SCRUB_VH}vh)` }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden">
        {/* Scroll-driven video. We never call `play()`; the user's scroll
            position drives `currentTime`. The mp4 is encoded with all
            keyframes (`-g 1`) so seeks land on the requested frame. */}
        <video
          ref={videoRef}
          src="/media/hero.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
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
      </div>
    </section>
  );
}
