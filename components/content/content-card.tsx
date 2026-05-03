"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const thumb =
    (c.type === "item" && "imageUrl" in c.data && c.data.imageUrl) ||
    (c.type === "artifact" && "imageUrl" in c.data && c.data.imageUrl) ||
    (c.type === "character" && "portraitUrl" in c.data && c.data.portraitUrl) ||
    TYPE_FALLBACK_IMAGE[c.type];

  // Clicking the title opens a modal preview by adding `?content=<id>` to the
  // URL. We still render an <a> with `href=/content/<id>` so middle-click /
  // Ctrl-click / right-click → "Open in new tab" all keep working and the
  // dedicated route is shareable. Plain left-click is intercepted to swap to
  // the modal flow.
  const openModal = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Honour modifier keys / non-primary clicks — those go to /content/[id]
      if (
        e.button !== 0 ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      e.preventDefault();
      const next = new URLSearchParams(params.toString());
      next.set("content", c.id);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [c.id, params, pathname, router]
  );

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
        {/*
          User-controlled images (portraitUrl / imageUrl) come from arbitrary
          hosts. We deliberately use a plain <img> instead of next/image so we
          don't have to allow-list every possible avatar/image domain in
          next.config — and so an unknown host doesn't crash SSR with
          "hostname not configured".
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb}
          alt={c.title}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur">
          {CONTENT_TYPE_LABEL_RU[c.type]}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold leading-tight">
          <Link
            href={`/content/${c.id}`}
            onClick={openModal}
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
