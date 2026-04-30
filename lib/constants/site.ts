export const SITE = {
  name: "GM Secret House",
  shortName: "GM·SH",
  description:
    "Платформа для мастеров и игроков Dungeons & Dragons: создание персонажей, карт, предметов и публикация хоумбрю.",
  url: "https://gm-secret-house.example",
  defaultLocale: "ru",
  ogImage: "/media/categories/artifacts.jpeg",
} as const;

/**
 * Top-level header navigation. Kept short on purpose — the rest of the
 * tools live behind the "Инструменты" entry, and the highlighted
 * "Неведомый мир?" call-to-action lives in the header itself.
 */
export const NAV_LINKS = [
  { href: "/library", label: "Библиотека" },
  { href: "/tools", label: "Инструменты" },
] as const;

export const FOOTER_LINKS = [
  {
    title: "Навигация",
    items: [
      { href: "/", label: "Главная" },
      { href: "/library", label: "Библиотека" },
      { href: "/library/rules", label: "Как это работает?" },
      { href: "/community?type=character", label: "Герои долины" },
      { href: "/register", label: "Отправиться в путь" },
      { href: "/tools", label: "Инструменты" },
      { href: "/tools/characters", label: "Войти в игру" },
    ],
  },
  {
    title: "Пользователь",
    items: [
      { href: "/login", label: "Вход" },
      { href: "/register", label: "Регистрация" },
      { href: "/login", label: "Восстановить пароль" },
      { href: "/library/rules", label: "Правила" },
      { href: "/community", label: "Техническая поддержка" },
    ],
  },
] as const;
