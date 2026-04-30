import { ru, type Translations } from "./ru";
import { en } from "./en";

export type Locale = "ru" | "en";

export const DEFAULT_LOCALE: Locale = "ru";

export const LOCALES: Record<Locale, Translations> = { ru, en };

/**
 * Look up a dotted-path key (e.g. "auth.login.title") in the active locale,
 * falling back to the default locale and finally to the key itself.
 */
export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  const fromActive = lookup(LOCALES[locale], key);
  if (fromActive !== undefined) return fromActive;
  if (locale !== DEFAULT_LOCALE) {
    const fromDefault = lookup(LOCALES[DEFAULT_LOCALE], key);
    if (fromDefault !== undefined) return fromDefault;
  }
  return key;
}

function lookup(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (
      cur &&
      typeof cur === "object" &&
      part in (cur as Record<string, unknown>)
    ) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

export { ru, en };
export type { Translations };
