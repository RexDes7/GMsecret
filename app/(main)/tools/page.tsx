import type { Metadata } from "next";
import Link from "next/link";
import { Hammer, Map as MapIcon, Sword } from "lucide-react";

export const metadata: Metadata = { title: "Инструменты создания" };

const TOOLS = [
  {
    href: "/tools/characters",
    title: "Конструктор персонажей",
    desc: "Имя, раса, класс, характеристики и снаряжение.",
    Icon: Hammer,
  },
  {
    href: "/tools/maps",
    title: "Конструктор карт",
    desc: "Сетка 10×10 — 100×100, ландшафты и маркеры, экспорт PNG.",
    Icon: MapIcon,
  },
  {
    href: "/tools/items",
    title: "Конструктор предметов",
    desc: "Тип, редкость, вес, стоимость, магические эффекты.",
    Icon: Sword,
  },
];

export default function ToolsHubPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold">
          Инструменты создания
        </h1>
        <p className="mt-2 text-muted-foreground">
          Создавай хоумбрю-контент с валидацией и автосохранением.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/40"
          >
            <t.Icon className="size-7 text-primary" />
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-xl font-semibold">
              {t.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
