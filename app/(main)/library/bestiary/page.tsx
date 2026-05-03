import type { Metadata } from "next";
import Link from "next/link";
import {
  getBestiaryFirstPage,
  type TtgBestiaryListItem,
} from "@/lib/reference/ttg-ssr";

export const metadata: Metadata = { title: "Бестиарий · Библиотека" };
export const revalidate = 43200;

export default async function BestiaryLibraryPage() {
  let items: TtgBestiaryListItem[] = [];
  let upstreamError: string | null = null;
  try {
    const res = await getBestiaryFirstPage();
    items = res.items;
  } catch (e) {
    upstreamError = (e as Error).message;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        / Бестиарий
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        Бестиарий
      </h1>
      <p className="mt-2 text-muted-foreground">
        {items.length
          ? `Первые ${items.length} существ. Полный каталог будет подключён позже — у источника пагинация требует авторизации.`
          : upstreamError
            ? "Не удалось загрузить каталог. Попробуйте позже."
            : "Каталог пуст."}
      </p>

      <ul className="mt-8 divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
        {items.map((c) => (
          <li key={c.url}>
            <Link
              href={`/library/bestiary/${c.url}`}
              className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">
                  {c.name.rus}
                </span>
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {c.type ?? "—"}
                  {c.challengeRailing && c.challengeRailing !== "—"
                    ? ` · ОУ ${c.challengeRailing}`
                    : ""}
                </span>
              </span>
              <span className="hidden shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
                {c.source?.name?.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
