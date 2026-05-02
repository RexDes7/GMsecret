import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityFeed } from "@/components/content/community-feed";
import { contentRepository } from "@/lib/db";
import { ru } from "@/lib/i18n/ru";

export const metadata: Metadata = { title: ru.community.title };
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  // SSR initial page of public content. The client component takes it from
  // here for filtering / search / pagination; when users post new content
  // it will refresh on next navigation.
  const initial = await contentRepository().list({
    onlyPublic: true,
    limit: 100,
  });
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">
          {ru.community.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{ru.community.subtitle}</p>
      </header>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">{ru.common.loading}</p>
        }
      >
        <CommunityFeed all={initial.items} />
      </Suspense>
    </div>
  );
}
