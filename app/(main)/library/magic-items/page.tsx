import type { Metadata } from "next";
import Link from "next/link";
import {
  getList,
  type TtgMagicItemListItem,
} from "@/lib/reference/ttg-client";
import { MagicItemsLibraryClient } from "./magic-items-library-client";

export const metadata: Metadata = { title: "Магические предметы · Библиотека" };
export const revalidate = 43200;

export default async function MagicItemsLibraryPage() {
  let items: TtgMagicItemListItem[] = [];
  let upstreamError: string | null = null;
  try {
    items = await getList<TtgMagicItemListItem>("magic-items");
  } catch (e) {
    upstreamError = (e as Error).message;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        / Магические предметы
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        Магические предметы
      </h1>
      <p className="mt-2 text-muted-foreground">
        {items.length
          ? `${items.length} предметов из официальных и неофициальных источников.`
          : upstreamError
            ? "Не удалось загрузить каталог. Попробуйте позже."
            : "Каталог пуст."}
      </p>

      {items.length ? <MagicItemsLibraryClient items={items} /> : null}
    </div>
  );
}
