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
      className="w-full"
    >
      <h2 id="categories-heading" className="sr-only">
        Категории контента
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {items.map(({ key, ...rest }) => (
          <ContentCategoryCard key={key} {...rest} />
        ))}
      </div>
    </section>
  );
}
