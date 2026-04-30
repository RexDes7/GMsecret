import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /**
   * When true, renders the wordmark ("THE SECRET HOUSE") under the GM
   * monogram. The header uses this; tighter spaces use just the icon.
   */
  withWordmark?: boolean;
};

/**
 * GM Secret House brand mark — a peaked-roof house silhouette with the
 * "GM" monogram inside, optionally followed by the "THE SECRET HOUSE"
 * wordmark.
 *
 * Pure SVG so it scales crisply at any size and inherits `currentColor`.
 */
export function GmLogo({ className, withWordmark = true }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 leading-none text-foreground",
        className
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 64 64"
        className="size-9 shrink-0"
        fill="none"
        stroke="currentColor"
      >
        {/* House outline */}
        <path
          d="M8 30 L32 8 L56 30 L56 56 L40 56 L40 38 L24 38 L24 56 L8 56 Z"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="color-mix(in oklch, currentColor 12%, transparent)"
        />
        {/* "GM" monogram */}
        <text
          x="32"
          y="30"
          textAnchor="middle"
          fontFamily="var(--font-heading), serif"
          fontWeight="700"
          fontSize="14"
          letterSpacing="0.04em"
          fill="currentColor"
          stroke="none"
        >
          GM
        </text>
      </svg>
      {withWordmark ? (
        <span className="flex flex-col gap-0.5">
          <span className="font-[family-name:var(--font-heading)] text-[0.95rem] font-bold leading-none tracking-[0.18em]">
            GM
          </span>
          <span className="text-[0.55rem] font-medium uppercase leading-none tracking-[0.28em] text-muted-foreground">
            The Secret House
          </span>
        </span>
      ) : null}
    </span>
  );
}
