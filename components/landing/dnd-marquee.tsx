"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Inline D&D dragon-shield mark used as the divider between repeated
 * "DUNGEONS & DRAGONS" labels in the marquee. Pure SVG so it scales
 * crisply at any size and inherits `currentColor`.
 */
function DndShield({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
    >
      <path d="M16 2 L4 6 V14 C4 21 9 27 16 30 C23 27 28 21 28 14 V6 Z M16 5.2 L25.4 8.4 V14 C25.4 19.6 21.4 24.4 16 27 C10.6 24.4 6.6 19.6 6.6 14 V8.4 Z" />
      <path d="M16 9 L11 12 V17 C11 19.5 13 22 16 23.4 C19 22 21 19.5 21 17 V12 Z" />
    </svg>
  );
}

const ITEMS = ["DUNGEONS & DRAGONS"] as const;

/**
 * Bright off-white marquee strip of "DUNGEONS & DRAGONS" labels with
 * dragon-shield dividers. The track scrolls infinitely; we duplicate the
 * content so the seam stays off-screen.
 */
export function DndMarquee() {
  const prefersReducedMotion = useReducedMotion();
  const items = Array.from({ length: 6 }, (_, i) => ITEMS[i % ITEMS.length]!);

  return (
    <section
      aria-label="D&D"
      className="relative w-full overflow-hidden border-y border-black/10 bg-[#f6e9d4] text-[#2c0e16]"
    >
      <div
        className={
          prefersReducedMotion
            ? "flex flex-nowrap items-center gap-10 whitespace-nowrap py-4"
            : "flex w-max flex-nowrap items-center gap-10 whitespace-nowrap py-4 [animation:gmsh-marquee_38s_linear_infinite]"
        }
      >
        {[...items, ...items].map((label, i) => (
          <div key={i} className="flex items-center gap-10">
            <span className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase tracking-[0.18em] sm:text-3xl">
              {label}
            </span>
            <DndShield />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes gmsh-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
