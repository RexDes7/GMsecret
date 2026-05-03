import type { Metadata } from "next";
import Link from "next/link";
import {
  getList,
  type TtgSpellListItem,
} from "@/lib/reference/ttg-client";
import { SpellsLibraryClient } from "./spells-library-client";

export const metadata: Metadata = { title: "Заклинания · Библиотека" };

// 12h ISR — the upstream catalogue grows slowly; the client also has its
// own filter state so we don't need per-request freshness.
export const revalidate = 43200;

export default async function SpellsLibraryPage() {
  let items: TtgSpellListItem[] = [];
  let upstreamError: string | null = null;
  try {
    items = await getList<TtgSpellListItem>("spells");
  } catch (e) {
    upstreamError = (e as Error).message;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        / Заклинания
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        Заклинания
      </h1>
      <p className="mt-2 text-muted-foreground">
        {items.length
          ? `${items.length} заклинаний из официальных и неофициальных книг.`
          : upstreamError
            ? "Не удалось загрузить каталог. Попробуйте позже."
            : "Каталог пуст."}
      </p>

      {items.length ? <SpellsLibraryClient items={items} /> : null}
    </div>
  );
}
