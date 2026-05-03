import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentRepository } from "@/lib/db";
import { ContentDetailView } from "@/components/content/content-detail-view";

type Params = Promise<{ id: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const c = await contentRepository().get(id);
  return { title: c?.title ?? "Не найдено" };
}

export default async function ContentDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const c = await contentRepository().get(id);
  if (!c || !c.isPublic) return notFound();

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <ContentDetailView c={c} headingAs="h1" />
    </article>
  );
}
