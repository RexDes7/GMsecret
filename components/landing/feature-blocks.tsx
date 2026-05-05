"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ru } from "@/lib/i18n/ru";

type Block = {
  num: string;
  title: string;
  desc: string;
};

const blocks: Block[] = [
  { num: "01", title: ru.features.f1.title, desc: ru.features.f1.desc },
  { num: "02", title: ru.features.f2.title, desc: ru.features.f2.desc },
  { num: "03", title: ru.features.f3.title, desc: ru.features.f3.desc },
  { num: "04", title: ru.features.f4.title, desc: ru.features.f4.desc },
];

export function FeatureBlocks() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section
      aria-labelledby="features-heading"
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6"
    >
      <h2 id="features-heading" className="sr-only">
        Возможности платформы
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {blocks.map((b, i) => (
          <motion.article
            key={b.num}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(108,16,28,0.55)_0%,rgba(58,8,16,0.85)_100%)] p-6 ring-1 ring-inset ring-white/5 transition-shadow hover:shadow-[0_18px_40px_-20px_rgba(220,20,60,0.55)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            <p className="font-[family-name:var(--font-heading)] text-6xl font-bold leading-none text-foreground sm:text-[5.5rem]">
              {b.num}
            </p>
            <h3 className="mt-6 font-[family-name:var(--font-heading)] text-base font-bold uppercase tracking-[0.18em] text-foreground">
              {b.title}
            </h3>
            <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-foreground/70">
              {b.desc}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
