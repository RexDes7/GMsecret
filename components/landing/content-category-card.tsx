"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  image: string;
  alt: string;
  title: string;
  tagline: string;
  className?: string;
};

export function ContentCategoryCard({
  href,
  image,
  alt,
  title,
  tagline,
  className,
}: Props) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      className={cn(
        "group relative isolate overflow-hidden rounded-2xl border border-border/60 bg-card/40",
        className
      )}
    >
      <Link href={href} className="block focus-visible:outline-none">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-wide">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Открыть →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
