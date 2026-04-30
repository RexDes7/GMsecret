export const SITE = {
  name: "GM Secret House",
  shortName: "GM·SH",
  description:
    "Платформа для мастеров и игроков Dungeons & Dragons: создание персонажей, карт, предметов и публикация хоумбрю.",
  url: "https://gm-secret-house.example",
  defaultLocale: "ru",
  ogImage: "/media/categories/artifacts.jpeg",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Главная" },
  { href: "/library", label: "Библиотека" },
  { href: "/community", label: "Сообщество" },
  { href: "/tools/characters", label: "Персонажи" },
  { href: "/tools/maps", label: "Карты" },
  { href: "/tools/items", label: "Предметы" },
] as const;

export const FOOTER_LINKS = [
  {
    title: "Навигация",
    items: [
      { href: "/", label: "Главная" },
      { href: "/library", label: "Библиотека" },
      { href: "/community", label: "Сообщество" },
    ],
  },
  {
    title: "Инструменты",
    items: [
      { href: "/tools/characters", label: "Конструктор персонажей" },
      { href: "/tools/maps", label: "Конструктор карт" },
      { href: "/tools/items", label: "Конструктор предметов" },
    ],
  },
  {
    title: "Аккаунт",
    items: [
      { href: "/login", label: "Войти" },
      { href: "/register", label: "Регистрация" },
      { href: "/profile/me", label: "Профиль" },
    ],
  },
] as const;
