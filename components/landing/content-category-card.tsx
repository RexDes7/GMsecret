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

/**
 * Wide landscape category card. The card image fills the background, a
 * dark-to-bottom gradient ensures contrast for the centered tagline and
 * the gold "title" stamp at the bottom of the card.
 */
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
        "group relative isolate overflow-hidden bg-card/40",
        className
      )}
    >
      <Link
        href={href}
        className="relative block aspect-[16/9] focus-visible:outline-none"
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 45vw, (min-width: 640px) 90vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        {/* Top gradient: dims the busy artwork so the centered tagline
            stays readable. Bottom gradient: gives the gold title stamp
            something to land on. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/85"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="max-w-md text-balance text-sm leading-relaxed text-foreground/85 sm:text-base">
            {tagline}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-6 pb-5 text-center">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase tracking-[0.18em] text-[#e9b771] sm:text-[1.6rem]">
            {title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
