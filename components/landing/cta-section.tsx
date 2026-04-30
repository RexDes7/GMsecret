import Link from "next/link";
import { ru } from "@/lib/i18n/ru";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-background to-background p-10 text-center sm:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(220,20,60,0.18),_transparent_60%)]"
        />
        <h2 className="mx-auto max-w-2xl font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl">
          {ru.cta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          {ru.cta.subtitle}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="glow-primary px-6">
            <Link href="/register">{ru.cta.primary}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-6">
            <Link href="/login">{ru.cta.secondary}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
