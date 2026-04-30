"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Hammer, Users, Sparkles } from "lucide-react";
import { ru } from "@/lib/i18n/ru";

type Block = {
  num: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

const blocks: Block[] = [
  {
    num: "01",
    icon: BookOpen,
    title: ru.features.f1.title,
    desc: ru.features.f1.desc,
  },
  {
    num: "02",
    icon: Hammer,
    title: ru.features.f2.title,
    desc: ru.features.f2.desc,
  },
  {
    num: "03",
    icon: Users,
    title: ru.features.f3.title,
    desc: ru.features.f3.desc,
  },
  {
    num: "04",
    icon: Sparkles,
    title: ru.features.f4.title,
    desc: ru.features.f4.desc,
  },
];

export function FeatureBlocks() {
  const prefersReducedMotion = useReducedMotion();
  return (
    <section
      aria-labelledby="features-heading"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6"
    >
      <h2 id="features-heading" className="sr-only">
        Возможности платформы
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {blocks.map((b, i) => {
          const Icon = b.icon;
          return (
            <motion.article
              key={b.num}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: "easeOut" }}
              className="group relative rounded-xl border border-border/70 bg-card/60 p-6 backdrop-blur-sm transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-primary/80">
                  {b.num}
                </span>
                <Icon className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-heading)] text-lg font-semibold">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {b.desc}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
