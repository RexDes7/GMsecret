import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SAMPLE_CONTENT } from "@/lib/data/sample-content";
import { ContentCard } from "@/components/content/content-card";
import { CONTENT_TYPE_LABEL_RU } from "@/components/content/labels";

type Params = Promise<{ username: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: { params: Params }) {
  const { username } = await params;
  const items = SAMPLE_CONTENT.filter((c) => c.authorUsername === username);

  // For now we treat any author with at least one item as a known user.
  // Without a backend we still render an empty profile if the username
  // matches what someone might have just registered to.
  if (
    items.length === 0 &&
    !["me", "admin"].includes(username) &&
    !/^[A-Za-z0-9_-]{3,32}$/.test(username)
  ) {
    return notFound();
  }

  const grouped = new Map<string, typeof items>();
  for (const it of items) {
    const arr = grouped.get(it.type) ?? [];
    arr.push(it);
    grouped.set(it.type, arr);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-full bg-primary/15 text-2xl font-bold text-primary ring-1 ring-primary/40">
            {username[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
              @{username}
            </h1>
            <p className="text-sm text-muted-foreground">
              Публикаций: {items.length}
            </p>
          </div>
        </div>
        <Link
          href="/profile/me/edit"
          className="rounded-md border border-border/60 px-3 py-1.5 text-sm hover:border-primary"
        >
          Редактировать профиль
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          У этого пользователя пока нет публичных публикаций.
        </p>
      ) : (
        <div className="space-y-10">
          {Array.from(grouped.entries()).map(([type, arr]) => (
            <section key={type}>
              <h2 className="mb-4 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                {
                  CONTENT_TYPE_LABEL_RU[
                    type as keyof typeof CONTENT_TYPE_LABEL_RU
                  ]
                }
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {arr.map((c) => (
                  <ContentCard key={c.id} c={c} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
