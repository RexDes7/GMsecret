import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentCard } from "@/components/content/content-card";
import { CONTENT_TYPE_LABEL_RU } from "@/components/content/labels";
import { MyDraftsSection } from "@/components/profile/my-drafts-section";
import { contentRepository, userRepository } from "@/lib/db";

type Params = Promise<{ username: string }>;

export const dynamic = "force-dynamic";

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

  // Direct repository calls — this page is SSR on the same process as the
  // API, so going through fetch('/api/...') would be wasteful. The repo
  // contract is identical to what the REST endpoints expose.
  const [profile, authored] = await Promise.all([
    userRepository().getByUsername(username),
    contentRepository().list({
      authorUsername: username,
      onlyPublic: true,
      limit: 100,
    }),
  ]);

  // Accept username shapes even without a profile row yet — the profile is
  // lazily created on first API read.
  if (!profile && !/^[A-Za-z0-9_-]{3,32}$/.test(username)) {
    return notFound();
  }

  const items = authored.items;
  const grouped = new Map<string, typeof items>();
  for (const it of items) {
    const arr = grouped.get(it.type) ?? [];
    arr.push(it);
    grouped.set(it.type, arr);
  }

  const displayName = profile?.displayName || username;
  const avatar = profile?.avatarUrl;
  const bio = profile?.bio;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {avatar ? (
            // Plain <img> — user-provided avatar URLs come from arbitrary
            // hosts that we don't want to allow-list in next.config.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt={`Аватар @${username}`}
              width={72}
              height={72}
              className="size-[72px] rounded-full object-cover ring-1 ring-primary/40"
            />
          ) : (
            <div className="grid size-[72px] place-items-center rounded-full bg-primary/15 text-2xl font-bold text-primary ring-1 ring-primary/40">
              {username[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              @{username} · Публикаций: {items.length}
            </p>
            {bio ? (
              <p className="mt-2 max-w-prose whitespace-pre-line text-sm text-foreground/80">
                {bio}
              </p>
            ) : null}
          </div>
        </div>
        <Link
          href="/profile/me/edit"
          className="rounded-lg border border-border/60 px-3 py-1.5 text-sm hover:border-primary"
        >
          Редактировать профиль
        </Link>
      </header>

      <MyDraftsSection username={username} />

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
