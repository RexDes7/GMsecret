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
    title: "Создавай миры. Веди героев. Храни легенды.",
    subtitle:
      "Полная платформа для D&D: справочники, инструменты, сообщество и хоумбрю — всё в одном месте.",
    ctaPrimary: "Начать приключение",
    ctaSecondary: "Изучить библиотеку",
  },
  features: {
    f1: {
      title: "Справочник правил",
      desc: "Классы, расы, заклинания, предметы и существа — структурированная база D&D.",
    },
    f2: {
      title: "Инструменты создания",
      desc: "Конструкторы персонажей, карт и предметов с валидацией и автосохранением.",
    },
    f3: {
      title: "Сообщество",
      desc: "Делись хоумбрю-контентом, находи материалы других мастеров и игроков.",
    },
    f4: {
      title: "Готово к приключению",
      desc: "Тёмный фэнтези-интерфейс, быстрый поиск, экспорт карт и портретов.",
    },
  },
  categories: {
    equipment: "Снаряжение",
    spells: "Заклинания",
    artifacts: "Артефакты",
    bestiary: "Бестиарий",
    tagline: {
      equipment: "Оружие, доспехи и снаряжение героев",
      spells: "Магия любых школ и уровней",
      artifacts: "Легендарные предметы и реликвии",
      bestiary: "Существа, монстры и их статблоки",
    },
  },
  heroes: {
    section: "Герои Долины",
    cta: "Смотреть всех персонажей",
  },
  cta: {
    title: "Готов сесть за стол?",
    subtitle:
      "Зарегистрируйся, чтобы сохранять персонажей, карты и публиковать хоумбрю в сообществе.",
    primary: "Создать аккаунт",
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
