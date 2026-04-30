import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/**
 * GM Secret House brand mark — rendered from the original raster artwork
 * shipped at `public/brand/logo.png`. The asset is white-on-transparent,
 * so it relies on the dark header backdrop for contrast. We render a plain
 * `<img>` (instead of `next/image`) because the file is tiny and we want
 * it visible immediately on first paint without LQIP processing in dev.
 */
export function GmLogo({ className }: Props) {
  return (
    <span className={cn("inline-flex items-center leading-none", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.png"
        alt="GM Secret House"
        width={972}
        height={492}
        className="h-9 w-auto sm:h-10"
      />
    </span>
  );
}
