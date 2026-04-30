import type { AbilityScoresT } from "@/lib/schemas/content";

/**
 * D&D 5e ability modifier formula:  floor((score - 10) / 2)
 *
 * Property: for any integer score s in [1, 30], the modifier equals
 * floor((s - 10) / 2). (Property 3.)
 */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export const ABILITY_KEYS = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
] as const satisfies readonly (keyof AbilityScoresT)[];

export const ABILITY_LABEL_RU: Record<keyof AbilityScoresT, string> = {
  str: "Сила",
  dex: "Ловкость",
  con: "Телосложение",
  int: "Интеллект",
  wis: "Мудрость",
  cha: "Харизма",
};
