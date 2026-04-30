import { ContentCategoryCard } from "./content-category-card";
import { ru } from "@/lib/i18n/ru";

const items = [
  {
    key: "equipment",
    href: "/community?type=item",
    image: "/media/categories/equipment.jpeg",
    alt: "Снаряжение",
    title: ru.categories.equipment,
    tagline: ru.categories.tagline.equipment,
  },
  {
    key: "spells",
    href: "/community?type=spell",
    image: "/media/categories/spells.jpeg",
    alt: "Заклинания",
    title: ru.categories.spells,
    tagline: ru.categories.tagline.spells,
  },
  {
    key: "artifacts",
    href: "/community?type=artifact",
    image: "/media/categories/artifacts.jpeg",
    alt: "Артефакты",
    title: ru.categories.artifacts,
    tagline: ru.categories.tagline.artifacts,
  },
  {
    key: "bestiary",
    href: "/community?type=creature",
    image: "/media/categories/bestiary.jpeg",
    alt: "Бестиарий",
    title: ru.categories.bestiary,
    tagline: ru.categories.tagline.bestiary,
  },
] as const;

export function ContentCategories() {
  return (
    <section
      aria-labelledby="categories-heading"
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6"
    >
      <header className="mb-8 flex items-end justify-between">
        <h2
          id="categories-heading"
          className="font-[family-name:var(--font-heading)] text-3xl font-bold sm:text-4xl"
        >
          Категории контента
        </h2>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ key, ...rest }) => (
          <ContentCategoryCard key={key} {...rest} />
        ))}
      </div>
    </section>
  );
}
