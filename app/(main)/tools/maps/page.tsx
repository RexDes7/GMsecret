import type { Metadata } from "next";
import { MapBuilder } from "@/components/tools/map-builder";
import { ru } from "@/lib/i18n/ru";

export const metadata: Metadata = { title: ru.tools.maps.title };

export default function MapsToolPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">
          {ru.tools.maps.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{ru.tools.maps.subtitle}</p>
      </header>
      <MapBuilder />
    </div>
  );
}
