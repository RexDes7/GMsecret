"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import type { ContentRecord } from "@/lib/schemas/content";
import { ContentClient } from "@/lib/services/content-client";
import { useAuth } from "@/components/providers/auth-provider";
import { ContentDetailView } from "@/components/content/content-detail-view";
import Link from "next/link";

const PARAM = "content";

/**
 * Global content preview modal. Reads `?content=<id>` from the URL and
 * fetches the matching record on demand. Closing the modal removes the
 * query param, leaving the underlying page intact.
 *
 * The modal is mounted once in the (main) layout, so any place that links
 * to `?content=<id>` (notably `ContentCard`) gets a preview without a full
 * route navigation. The dedicated `/content/[id]` route still renders the
 * same `ContentDetailView` for share links / SEO.
 */
export function ContentModal() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const id = params.get(PARAM);
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  // The currently loaded record (or error) is keyed by the active id. While
  // a fetch is in flight `state` is `null`, so the loading skeleton shows.
  // We deliberately avoid a separate `loading` state — the eslint rule
  // `react-hooks/set-state-in-effect` would complain about a synchronous
  // `setLoading(true)` inside an effect.
  const [state, setState] = React.useState<{
    id: string;
    record: ContentRecord | null;
    error: string | null;
  } | null>(null);

  // Fetch the record when the id query param appears or changes.
  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    ContentClient.get(id, user)
      .then((r) => {
        if (!cancelled) setState({ id, record: r, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setState({
            id,
            record: null,
            error: (e as Error).message || "Не удалось загрузить",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const loading = !!id && (!state || state.id !== id);
  const record = !loading && state?.record ? state.record : null;
  const error = !loading && state?.error ? state.error : null;

  // Close handler — strips the query param.
  const close = React.useCallback(() => {
    const next = new URLSearchParams(params.toString());
    next.delete(PARAM);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  // Esc to close.
  React.useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [id, close]);

  // Lock body scroll while the modal is open.
  React.useEffect(() => {
    if (!id) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [id]);

  return (
    <AnimatePresence>
      {id ? (
        <motion.div
          key="content-modal"
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label={record?.title ?? "Просмотр объекта"}
        >
          <button
            type="button"
            aria-label="Закрыть"
            onClick={close}
            className="absolute inset-0 cursor-default bg-background/85 backdrop-blur"
          />
          <motion.div
            className="relative z-10 m-0 flex w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border/60 bg-card shadow-2xl sm:m-4 sm:rounded-2xl"
            initial={{ y: prefersReducedMotion ? 0 : 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: prefersReducedMotion ? 0 : 16, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
            style={{ maxHeight: "90vh" }}
          >
            <div className="flex items-center justify-between border-b border-border/60 bg-background/40 px-4 py-2.5">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Просмотр
              </span>
              <div className="flex items-center gap-1">
                {record ? (
                  <Link
                    href={`/content/${record.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    onClick={close}
                  >
                    <ExternalLink className="size-3.5" /> На отдельной странице
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Закрыть окно"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-5 py-6 sm:px-7">
              {loading ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Загрузка…
                </p>
              ) : error ? (
                <p className="py-10 text-center text-sm text-destructive">
                  {error}
                </p>
              ) : record ? (
                <ContentDetailView c={record} headingAs="h2" />
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
