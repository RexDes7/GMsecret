import { z } from "zod";

/**
 * Domain schemas for user-generated content. Each top-level content type
 * (character, map, item, spell, artifact, creature) has a discriminated
 * `data` payload, validated by Zod.
 *
 * Property: every payload that satisfies its schema can be re-serialized
 * via JSON.stringify and re-parsed without loss (Property 2/6).
 */

export const ContentTypeEnum = z.enum([
  "character",
  "map",
  "item",
  "spell",
  "artifact",
  "creature",
]);
export type ContentType = z.infer<typeof ContentTypeEnum>;

// ───────────────────────────────────────────────────────── Character

export const AbilityScores = z.object({
  str: z.number().int().min(1).max(30),
  dex: z.number().int().min(1).max(30),
  con: z.number().int().min(1).max(30),
  int: z.number().int().min(1).max(30),
  wis: z.number().int().min(1).max(30),
  cha: z.number().int().min(1).max(30),
});
export type AbilityScoresT = z.infer<typeof AbilityScores>;

export const CharacterData = z.object({
  name: z.string().min(1).max(80),
  race: z.string().min(1).max(40),
  class: z.string().min(1).max(40),
  level: z.number().int().min(1).max(20),
  abilityScores: AbilityScores,
  background: z.string().max(2000).optional().default(""),
  skills: z.array(z.string().max(40)).max(64).default([]),
  equipment: z.array(z.string().max(80)).max(128).default([]),
  spells: z.array(z.string().max(80)).max(128).default([]),
  portraitUrl: z.string().url().optional().or(z.literal("")).default(""),
});
export type CharacterDataT = z.infer<typeof CharacterData>;

// ───────────────────────────────────────────────────────── Map

export const MapTerrainEnum = z.enum([
  "floor",
  "wall",
  "door",
  "water",
  "lava",
  "grass",
  "stone",
  "void",
]);
export type MapTerrain = z.infer<typeof MapTerrainEnum>;

export const MapMarker = z.object({
  id: z.string().min(1),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  label: z.string().max(40),
  icon: z.string().max(40).optional(),
});

/**
 * A discrete asset placed on the map (tree, mountain, table, throne, …).
 * Position is in cell units and may be fractional so brush scatter looks
 * natural. `kind` references a key in the inline SVG catalog at
 * `lib/maps/asset-catalog.ts`. `scale` is a multiplier (1 = one cell wide),
 * `rotation` is in degrees.
 */
export const MapObject = z.object({
  id: z.string().min(1),
  // Built-in kinds are short slugs ("tree-pine"), but admin-uploaded
  // assets use `custom:<uuid>` which is 43 chars — keep some headroom.
  kind: z.string().min(1).max(80),
  x: z.number().min(0),
  y: z.number().min(0),
  scale: z.number().min(0.1).max(5).optional(),
  rotation: z.number().min(-360).max(360).optional(),
});
export type MapObjectT = z.infer<typeof MapObject>;

export const MapData = z
  .object({
    width: z.number().int().min(10).max(100),
    height: z.number().int().min(10).max(100),
    cells: z.array(z.array(MapTerrainEnum)),
    markers: z.array(MapMarker).max(256).default([]),
    objects: z.array(MapObject).max(4096).default([]),
  })
  .superRefine((m, ctx) => {
    if (m.cells.length !== m.height) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cells"],
        message: "Размер cells.length должен равняться height",
      });
    }
    for (let y = 0; y < m.cells.length; y++) {
      const row = m.cells[y];
      if (!row || row.length !== m.width) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cells", y],
          message: "Размер строки должен равняться width",
        });
        break;
      }
    }
    for (const mk of m.markers) {
      if (mk.x >= m.width || mk.y >= m.height) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["markers"],
          message: `Маркер ${mk.id} выходит за пределы карты`,
        });
      }
    }
  });
export type MapDataT = z.infer<typeof MapData>;

// ───────────────────────────────────────────────────────── Item

export const ItemRarityEnum = z.enum([
  "common",
  "uncommon",
  "rare",
  "very_rare",
  "legendary",
  "artifact",
]);

export const ItemData = z.object({
  name: z.string().min(1).max(80),
  type: z.string().min(1).max(40),
  rarity: ItemRarityEnum,
  description: z.string().max(4000).default(""),
  properties: z.array(z.string().max(80)).max(32).default([]),
  weight: z.number().min(0).max(10000),
  cost: z.number().min(0).max(1_000_000),
  magicalEffects: z.string().max(4000).optional().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")).default(""),
});
export type ItemDataT = z.infer<typeof ItemData>;

// ───────────────────────────────────────────────────────── Spell

export const SpellSchoolEnum = z.enum([
  "abjuration",
  "conjuration",
  "divination",
  "enchantment",
  "evocation",
  "illusion",
  "necromancy",
  "transmutation",
]);

export const SpellData = z.object({
  name: z.string().min(1).max(80),
  level: z.number().int().min(0).max(9),
  school: SpellSchoolEnum,
  castingTime: z.string().max(80),
  range: z.string().max(80),
  components: z.array(z.enum(["V", "S", "M"])).max(3),
  duration: z.string().max(80),
  description: z.string().max(4000),
  ritual: z.boolean().default(false),
  concentration: z.boolean().default(false),
});
export type SpellDataT = z.infer<typeof SpellData>;

// ───────────────────────────────────────────────────────── Artifact

export const ArtifactData = z.object({
  name: z.string().min(1).max(80),
  origin: z.string().max(160).default(""),
  description: z.string().max(8000),
  attunement: z.boolean().default(false),
  powers: z.array(z.string().max(160)).max(32).default([]),
  curses: z.array(z.string().max(160)).max(16).default([]),
  imageUrl: z.string().url().optional().or(z.literal("")).default(""),
});
export type ArtifactDataT = z.infer<typeof ArtifactData>;

// ───────────────────────────────────────────────────────── Creature

export const CreatureData = z.object({
  name: z.string().min(1).max(80),
  size: z.enum(["tiny", "small", "medium", "large", "huge", "gargantuan"]),
  type: z.string().max(40),
  alignment: z.string().max(40).default(""),
  cr: z.number().min(0).max(30),
  hp: z.number().int().min(1).max(9999),
  ac: z.number().int().min(0).max(40),
  speed: z.number().int().min(0).max(200),
  abilityScores: AbilityScores,
  description: z.string().max(8000).default(""),
});
export type CreatureDataT = z.infer<typeof CreatureData>;

// ───────────────────────────────────────────────────────── Discriminated union

export const ContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("character"), data: CharacterData }),
  z.object({ type: z.literal("map"), data: MapData }),
  z.object({ type: z.literal("item"), data: ItemData }),
  z.object({ type: z.literal("spell"), data: SpellData }),
  z.object({ type: z.literal("artifact"), data: ArtifactData }),
  z.object({ type: z.literal("creature"), data: CreatureData }),
]);

export const ContentInputSchema = z
  .object({
    title: z.string().min(1).max(120),
    description: z.string().max(2000).default(""),
    isPublic: z.boolean().default(false),
    tags: z.array(z.string().max(40)).max(16).default([]),
  })
  .and(ContentSchema);
export type ContentInput = z.infer<typeof ContentInputSchema>;

export const ContentRecordSchema = z
  .object({
    id: z.string(),
    authorId: z.string(),
    authorUsername: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    views: z.number().int().min(0).default(0),
    featured: z.boolean().default(false),
  })
  .and(ContentInputSchema);
export type ContentRecord = z.infer<typeof ContentRecordSchema>;
