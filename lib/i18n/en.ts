import type { Translations } from "./ru";

/**
 * English translations (secondary locale).
 * Keys mirror lib/i18n/ru.ts.
 */
export const en: Translations = {
  common: {
    appName: "GM Secret House",
    appTagline: "Home of GMs & Dungeon Heroes",
    loading: "Loading…",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    submit: "Submit",
    search: "Search",
    error: "Error",
    retry: "Retry",
    notFound: "Not found",
    locale: "Language",
  },
  hero: {
    eyebrow: "The GM's Secret House",
    title: "Join the ranks of the greatest heroes",
    subtitle:
      "A flexible builder with hundreds of races, classes and spells. Forge your perfect build in minutes!",
    ctaPrimary: "Begin",
    ctaSecondary: "Tools",
  },
  features: {
    f1: {
      title: "Build a hero",
      desc: "A friendly builder that brings your ideas to life.",
    },
    f2: {
      title: "Ready-made builds",
      desc: "Thousands of unique builds shared by the community.",
    },
    f3: {
      title: "Explore D&D",
      desc: "All lore and rules in one convenient library.",
    },
    f4: {
      title: "Share",
      desc: "Publish your heroes and earn the spotlight.",
    },
  },
  categories: {
    equipment: "Equipment",
    spells: "Spells",
    artifacts: "Artifacts",
    bestiary: "Bestiary",
    tagline: {
      equipment: "Weapons, armor and gear",
      spells: "Magic of every school and level",
      artifacts: "Legendary items and relics",
      bestiary: "Creatures, monsters and stat blocks",
    },
  },
  heroes: {
    section: "Heroes of the Valley",
    cta: "See all characters",
  },
  cta: {
    title: "Ready for adventure?",
    subtitle:
      "Build your hero, share your story, and conquer the Forgotten Realms with thousands of fellow adventurers!",
    primary: "Begin",
    secondary: "I already have an account",
  },
  auth: {
    register: {
      title: "Sign up",
      subtitle: "Create an account and start your adventure.",
      email: "Email",
      username: "Username",
      password: "Password",
      confirmPassword: "Confirm password",
      submit: "Create account",
      haveAccount: "Already have an account?",
      signIn: "Sign in",
    },
    login: {
      title: "Sign in",
      subtitle: "Welcome back, master.",
      email: "Email",
      password: "Password",
      remember: "Remember me",
      submit: "Sign in",
      noAccount: "No account?",
      signUp: "Sign up",
      forgot: "Forgot password?",
    },
    errors: {
      required: "This field is required",
      invalidEmail: "Invalid email",
      usernameTooShort: "Username must be at least 3 characters",
      usernameInvalid: "Letters, digits, _ and - only",
      passwordTooShort: "Password must be at least 8 characters",
      passwordsMismatch: "Passwords do not match",
      duplicateEmail: "An account with this email already exists",
      duplicateUsername: "Username is taken",
      invalidCredentials: "Wrong email or password",
      generic: "Something went wrong. Please try again.",
    },
  },
  tools: {
    characters: {
      title: "Character Builder",
      subtitle: "Build a hero for your adventure.",
    },
    maps: {
      title: "Map Builder",
      subtitle: "Draw dungeons and landscapes on a grid.",
    },
    items: {
      title: "Item Builder",
      subtitle: "Describe gear, weapons or artifacts.",
    },
  },
  community: {
    title: "Community",
    subtitle: "Homebrew content from GMs and players.",
    filterAll: "All",
    empty: "No publications yet. Be the first!",
  },
  library: {
    title: "Library",
    subtitle: "Rule references and system materials.",
  },
  admin: {
    title: "Admin Panel",
    subtitle: "User management and content moderation.",
  },
};
