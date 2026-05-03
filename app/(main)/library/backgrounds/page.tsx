import type { Metadata } from "next";
import Link from "next/link";
import {
  getList,
  type TtgBackgroundListItem,
} from "@/lib/reference/ttg-client";
import { BackgroundsLibraryClient } from "./backgrounds-library-client";

export const metadata: Metadata = { title: "Предыстории · Библиотека" };
export const revalidate = 43200;

export default async function BackgroundsLibraryPage() {
  let items: TtgBackgroundListItem[] = [];
  let upstreamError: string | null = null;
  try {
    items = await getList<TtgBackgroundListItem>("backgrounds");
  } catch (e) {
    upstreamError = (e as Error).message;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        / Предыстории
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        Предыстории
      </h1>
      <p className="mt-2 text-muted-foreground">
        {items.length
          ? `${items.length} предысторий из официальных и неофициальных источников.`
          : upstreamError
            ? "Не удалось загрузить каталог. Попробуйте позже."
            : "Каталог пуст."}
      </p>

      {items.length ? <BackgroundsLibraryClient items={items} /> : null}
    </div>
  );
}
