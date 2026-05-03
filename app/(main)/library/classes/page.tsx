import type { Metadata } from "next";
import Link from "next/link";
import {
  getClassList,
  type TtgClassListItem,
} from "@/lib/reference/ttg-ssr";

export const metadata: Metadata = { title: "Классы · Библиотека" };
export const revalidate = 43200;

function abs(url: string) {
  return url.startsWith("http") ? url : `https://new.ttg.club${url}`;
}

export default async function ClassesLibraryPage() {
  let items: TtgClassListItem[] = [];
  let upstreamError: string | null = null;
  try {
    items = await getClassList();
  } catch (e) {
    upstreamError = (e as Error).message;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        <Link href="/library" className="hover:underline">
          Библиотека
        </Link>{" "}
        / Классы
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
        Классы
      </h1>
      <p className="mt-2 text-muted-foreground">
        {items.length
          ? `${items.length} классов с архетипами и особенностями.`
          : upstreamError
            ? "Не удалось загрузить каталог. Попробуйте позже."
            : "Каталог пуст."}
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <li key={c.url}>
            <Link
              href={`/library/classes/${c.url}`}
              className="group block overflow-hidden rounded-xl border border-border/60 bg-card/40 transition-colors hover:border-primary/40"
            >
              {c.image ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={abs(c.image)}
                    alt={c.name.rus}
                    className="size-full object-cover"
                  />
                </div>
              ) : null}
              <div className="p-4">
                <p className="font-[family-name:var(--font-heading)] text-lg font-semibold">
                  {c.name.rus}
                </p>
                {c.name.eng ? (
                  <p className="text-xs text-muted-foreground">{c.name.eng}</p>
                ) : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.source?.name?.label}
                  {c.hasSubclasses ? " · с архетипами" : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
