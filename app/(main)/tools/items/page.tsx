import type { Metadata } from "next";
import { ItemBuilder } from "@/components/tools/item-builder";
import { ru } from "@/lib/i18n/ru";

export const metadata: Metadata = { title: ru.tools.items.title };

export default function ItemsToolPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">
          {ru.tools.items.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{ru.tools.items.subtitle}</p>
      </header>
      <ItemBuilder />
    </div>
  );
}
