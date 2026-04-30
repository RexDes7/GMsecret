import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /**
   * When true, renders the wordmark ("THE SECRET HOUSE") next to the GM
   * house mark. The header uses this; tighter spaces use just the icon.
   */
  withWordmark?: boolean;
};

/**
 * GM Secret House brand mark — a peaked-roof house silhouette with the
 * "GM" monogram inside, optionally followed by a stacked
 * "THE / SECRET / HOUSE" wordmark.
 *
 * Pure SVG so it scales crisply at any size and inherits `currentColor`.
 */
export function GmLogo({ className, withWordmark = true }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 leading-none text-foreground",
        className
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 64 64"
        className="size-10 shrink-0"
        fill="currentColor"
      >
        {/* Stylized peaked-roof + chimney silhouette filled white. */}
        <path
          fill="currentColor"
          d="M32 4 L4 26 V30 L11 30 V58 H53 V30 L60 30 V26 Z M44 16 V22 L52 28 V14 H44 Z"
        />
        {/* Knock out the inner area so the GM letters sit on the dark
            backing instead of being painted onto the silhouette. */}
        <path
          fill="var(--color-card, #1a0a0e)"
          d="M14 30 L32 16 L50 30 V54 H14 Z"
        />
        {/* "GM" monogram inside the house. */}
        <text
          x="32"
          y="46"
          textAnchor="middle"
          fontFamily="var(--font-heading), serif"
          fontWeight="800"
          fontSize="18"
          letterSpacing="0.02em"
          fill="currentColor"
        >
          GM
        </text>
      </svg>
      {withWordmark ? (
        <span className="flex flex-col gap-[1px] font-[family-name:var(--font-heading)] font-bold uppercase leading-[1.05]">
          <span className="text-[0.55rem] tracking-[0.32em] text-foreground/85">
            The
          </span>
          <span className="text-[0.7rem] tracking-[0.24em]">Secret</span>
          <span className="text-[0.7rem] tracking-[0.24em]">House</span>
        </span>
      ) : null}
    </span>
  );
}
