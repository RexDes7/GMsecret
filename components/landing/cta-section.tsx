import Link from "next/link";
import { ru } from "@/lib/i18n/ru";

export function CtaSection() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-[linear-gradient(180deg,rgba(80,12,22,0.55)_0%,rgba(140,18,32,0.85)_55%,rgba(180,28,48,0.95)_100%)] py-20 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,200,160,0.12),transparent_55%)]"
      />
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase tracking-[0.06em] sm:text-4xl md:text-5xl">
          {ru.cta.title}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-foreground/85 sm:text-lg">
          {ru.cta.subtitle}
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            href="/register"
            // `leading-none` + the `pl-[…+0.24em]` shim keep the
            // uppercase label centred both horizontally and vertically.
            className="inline-flex items-center justify-center rounded-xl bg-foreground px-12 py-4 pl-[calc(3rem+0.24em)] text-sm font-bold uppercase leading-none tracking-[0.24em] text-background shadow-lg transition-transform hover:-translate-y-0.5"
          >
            {ru.cta.primary}
          </Link>
        </div>
      </div>
    </section>
  );
}
