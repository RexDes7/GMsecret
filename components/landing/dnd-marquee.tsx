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

/**
 * One running line of "DUNGEONS & DRAGONS" labels with shield dividers.
 * The track is duplicated so the seam stays off-screen during the loop;
 * `direction="reverse"` reverses the scroll without redefining keyframes.
 */
function MarqueeRow({
  direction = "forward",
}: {
  direction?: "forward" | "reverse";
}) {
  const labels = Array.from({ length: 8 }, () => "DUNGEONS & DRAGONS");
  return (
    <div className="overflow-hidden">
      <div
        className="flex w-max flex-nowrap items-center gap-10 whitespace-nowrap py-3 [animation:gmsh-marquee_38s_linear_infinite] motion-reduce:[animation:none]"
        style={
          direction === "reverse" ? { animationDirection: "reverse" } : undefined
        }
      >
        {[...labels, ...labels].map((label, i) => (
          <div key={i} className="flex items-center gap-10">
            <span className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase tracking-[0.18em] sm:text-3xl">
              {label}
            </span>
            <DndShield />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Two stacked "DUNGEONS & DRAGONS" running tapes: top scrolls left, bottom
 * scrolls right. The contrast band reads as a divider between sections.
 *
 * Why an SSR-safe global keyframe?
 * `<style jsx>` would scope the keyframe name and break the Tailwind
 * arbitrary `[animation:gmsh-marquee_…]` reference, so we use
 * `<style jsx global>` to keep the name unscoped.
 */
export function DndMarquee() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label="Dungeons & Dragons"
      className="relative w-full overflow-hidden border-y border-black/15 bg-[#f6e9d4] text-[#2c0e16]"
    >
      <div className="flex flex-col">
        <MarqueeRow direction="forward" />
        <div aria-hidden className="h-px bg-black/15" />
        <MarqueeRow direction="reverse" />
      </div>

      {/* Without animation when the user prefers reduced motion: the
          translateX never starts, so nothing scrolls. We still render the
          row so the section is not empty. */}
      {prefersReducedMotion ? null : (
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
      )}
    </section>
  );
}
