"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ContentRecord } from "@/lib/schemas/content";
import { CONTENT_TYPE_LABEL_RU } from "@/components/content/labels";

const TYPE_FALLBACK_IMAGE: Record<ContentRecord["type"], string> = {
  character: "/media/heroes/legolas.png",
  map: "/media/categories/equipment.jpeg",
  item: "/media/categories/equipment.jpeg",
  spell: "/media/categories/spells.jpeg",
  artifact: "/media/categories/artifacts.jpeg",
  creature: "/media/categories/bestiary.jpeg",
};

export function ContentCard({
  c,
  highlight,
}: {
  c: ContentRecord;
  highlight?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const thumb =
    (c.type === "item" && "imageUrl" in c.data && c.data.imageUrl) ||
    (c.type === "character" && "portraitUrl" in c.data && c.data.portraitUrl) ||
    TYPE_FALLBACK_IMAGE[c.type];

  // The whole card is clickable using the "stretched link" pattern: the
  // primary <Link> only wraps the title but covers the rest of the card via
  // an absolute pseudo-overlay. The author <Link> stays as a real anchor on
  // top of the overlay (relative + z-10), so we never nest <a> in <a>.
  return (
    <motion.article
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/40"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/40">
        <Image
          src={thumb}
          alt={c.title}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 95vw"
          loading="lazy"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur">
          {CONTENT_TYPE_LABEL_RU[c.type]}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold leading-tight">
          <Link
            href={`/content/${c.id}`}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring/60"
          >
            {renderHighlight(c.title, highlight)}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {renderHighlight(c.description, highlight)}
        </p>
        <p className="text-xs text-muted-foreground/80">
          автор:{" "}
          <Link
            href={`/profile/${c.authorUsername}`}
            className="relative z-10 text-primary hover:underline"
          >
            {c.authorUsername}
          </Link>{" "}
          · {new Date(c.createdAt).toLocaleDateString("ru-RU")}
        </p>
      </div>
    </motion.article>
  );
}

function renderHighlight(text: string, q?: string): React.ReactNode {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/30 text-foreground">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}
