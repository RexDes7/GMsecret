/**
 * Russian translations (primary locale).
 * Keep keys flat to make lookup predictable. Use namespaced sections via
 * dotted keys, e.g. "auth.login.title".
 */
export const ru = {
  common: {
    appName: "GM Secret House",
    appTagline: "Платформа Мастеров и Героев Подземелий",
    loading: "Загрузка…",
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    edit: "Редактировать",
    back: "Назад",
    next: "Далее",
    submit: "Отправить",
    search: "Поиск",
    error: "Ошибка",
    retry: "Повторить",
    notFound: "Не найдено",
    locale: "Язык",
  },
  hero: {
    eyebrow: "Дом тайн Мастера",
    title: "Присоединяйся к рядам величайших героев",
    subtitle:
      "Гибкий конструктор с доступом к сотням рас, классов и заклинаний. Собери идеальный билд за пару минут!",
    ctaPrimary: "В путь",
    ctaSecondary: "Инструменты",
  },
  features: {
    f1: {
      title: "Создавай героя",
      desc: "Удобный конструктор для воплощения ваших идей.",
    },
    f2: {
      title: "Готовые билды",
      desc: "Тысячи уникальных решений от сообщества.",
    },
    f3: {
      title: "Исследуй D&D",
      desc: "Весь лор и правила в одной удобной библиотеке.",
    },
    f4: {
      title: "Поделись",
      desc: "Публикуйте своих героев и получайте признание.",
    },
  },
  categories: {
    equipment: "Снаряжения",
    spells: "Заклинания",
    artifacts: "Артефакты",
    bestiary: "Бестиарий",
    tagline: {
      equipment: "Самое необходимое для величайшего героя",
      spells: "Магический гримуар Мистры",
      artifacts: "Величайшие магические предметы во всех вселенных",
      bestiary: "Гид-энциклопедия по невероятным существам",
    },
  },
  heroes: {
    section: "Герои Долины",
    cta: "Смотреть всех персонажей",
  },
  cta: {
    title: "Готов к приключениям?",
    subtitle:
      "Создай своего героя, поделись своей историей и покори Забытые Королевства вместе с тысячами искателей приключений!",
    primary: "В путь",
    secondary: "У меня уже есть аккаунт",
  },
  auth: {
    register: {
      title: "Регистрация",
      subtitle: "Создай аккаунт и начни своё приключение.",
      email: "Электронная почта",
      username: "Имя пользователя",
      password: "Пароль",
      confirmPassword: "Подтверждение пароля",
      submit: "Создать аккаунт",
      haveAccount: "Уже есть аккаунт?",
      signIn: "Войти",
    },
    login: {
      title: "Вход",
      subtitle: "С возвращением, мастер.",
      email: "Электронная почта",
      password: "Пароль",
      remember: "Запомнить меня",
      submit: "Войти",
      noAccount: "Нет аккаунта?",
      signUp: "Зарегистрироваться",
      forgot: "Забыли пароль?",
    },
    errors: {
      required: "Это поле обязательно",
      invalidEmail: "Некорректная электронная почта",
      usernameTooShort: "Имя пользователя минимум 3 символа",
      usernameInvalid: "Только буквы, цифры, _ и -",
      passwordTooShort: "Пароль минимум 8 символов",
      passwordsMismatch: "Пароли не совпадают",
      duplicateEmail: "Аккаунт с такой почтой уже существует",
      duplicateUsername: "Имя пользователя занято",
      invalidCredentials: "Неверная почта или пароль",
      generic: "Что-то пошло не так. Попробуйте ещё раз.",
    },
  },
  tools: {
    characters: {
      title: "Конструктор персонажей",
      subtitle: "Создай героя для своего приключения.",
    },
    maps: {
      title: "Конструктор карт",
      subtitle: "Рисуй подземелья и ландшафты в сетке.",
    },
    items: {
      title: "Конструктор предметов",
      subtitle: "Опиши снаряжение, оружие или артефакт.",
    },
  },
  community: {
    title: "Сообщество",
    subtitle: "Хоумбрю-контент от мастеров и игроков.",
    filterAll: "Все",
    empty: "Пока нет публикаций. Стань первым!",
  },
  library: {
    title: "Библиотека",
    subtitle: "Справочники, правила и системные материалы.",
  },
  admin: {
    title: "Админ-панель",
    subtitle: "Управление пользователями и модерация контента.",
  },
};

/**
 * Recursive translation tree. Keys mirror the structure of `ru`; values are
 * plain strings so other locales can override them with their own copy.
 */
export type Translations = {
  [K in keyof typeof ru]: (typeof ru)[K] extends string
    ? string
    : {
        [K2 in keyof (typeof ru)[K]]: (typeof ru)[K][K2] extends string
          ? string
          : { [K3 in keyof (typeof ru)[K][K2]]: string };
      };
};
