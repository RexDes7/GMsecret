import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityFeed } from "@/components/content/community-feed";
import { SAMPLE_CONTENT } from "@/lib/data/sample-content";
import { ru } from "@/lib/i18n/ru";

export const metadata: Metadata = { title: ru.community.title };

export default function CommunityPage() {
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
        <CommunityFeed all={SAMPLE_CONTENT} />
      </Suspense>
    </div>
  );
}
