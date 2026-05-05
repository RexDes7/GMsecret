/**
 * Inline-SVG catalog of map assets.
 *
 * Each entry is a self-contained SVG string sized to a 64×64 viewBox so the
 * canvas renderer can rasterise it at any cell size. `category` powers the
 * picker UI; `nameRu` is the label in Russian shown to the user.
 *
 * Adding a new asset = append a new entry. No external image files; SVG
 * markup is shipped with the bundle, no CDN/hosting needed.
 */

export type AssetCategory = "nature" | "furniture" | "structure" | "decor";

export type MapAsset = {
  kind: string;
  nameRu: string;
  category: AssetCategory;
  /** Self-contained SVG markup (must include xmlns + viewBox). */
  svg: string;
};

const VB = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"';

// ─────────────────────────────────────────── Nature

const TREE_OAK = `<svg ${VB}>
  <ellipse cx="32" cy="48" rx="14" ry="3" fill="rgba(0,0,0,0.35)"/>
  <rect x="29" y="36" width="6" height="14" fill="#5b3a1d"/>
  <circle cx="32" cy="28" r="18" fill="#1f5d2c"/>
  <circle cx="22" cy="22" r="10" fill="#28733a"/>
  <circle cx="42" cy="22" r="10" fill="#28733a"/>
  <circle cx="32" cy="14" r="9" fill="#2f8a45"/>
</svg>`;

const TREE_PINE = `<svg ${VB}>
  <ellipse cx="32" cy="56" rx="10" ry="2.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="30" y="48" width="4" height="10" fill="#3e2818"/>
  <polygon points="32,8 18,32 46,32" fill="#1f5d2c"/>
  <polygon points="32,18 14,42 50,42" fill="#28733a"/>
  <polygon points="32,28 12,52 52,52" fill="#2f8a45"/>
</svg>`;

const TREE_BIRCH = `<svg ${VB}>
  <ellipse cx="32" cy="52" rx="12" ry="3" fill="rgba(0,0,0,0.3)"/>
  <rect x="30" y="32" width="4" height="20" fill="#e6e6e6"/>
  <rect x="30" y="36" width="4" height="2" fill="#222"/>
  <rect x="30" y="42" width="4" height="2" fill="#222"/>
  <ellipse cx="32" cy="22" rx="16" ry="14" fill="#3a8a3a"/>
  <ellipse cx="22" cy="18" rx="9" ry="8" fill="#4ea84e"/>
  <ellipse cx="42" cy="18" rx="9" ry="8" fill="#4ea84e"/>
</svg>`;

const BUSH = `<svg ${VB}>
  <ellipse cx="32" cy="50" rx="16" ry="3" fill="rgba(0,0,0,0.3)"/>
  <ellipse cx="32" cy="40" rx="20" ry="14" fill="#2f6a2c"/>
  <ellipse cx="22" cy="36" rx="9" ry="8" fill="#3e8a3a"/>
  <ellipse cx="42" cy="36" rx="9" ry="8" fill="#3e8a3a"/>
  <ellipse cx="32" cy="30" rx="11" ry="9" fill="#4ea84e"/>
</svg>`;

const MOUNTAIN = `<svg ${VB}>
  <polygon points="4,56 26,18 38,32 50,12 60,56" fill="#5d5853"/>
  <polygon points="4,56 26,18 30,24 14,56" fill="#7a7470"/>
  <polygon points="50,12 60,56 44,56 42,28" fill="#6a655f"/>
  <polygon points="22,24 26,18 30,24 28,28" fill="#e8e8ee"/>
  <polygon points="46,18 50,12 54,18 50,22" fill="#e8e8ee"/>
</svg>`;

const HILL = `<svg ${VB}>
  <ellipse cx="32" cy="56" rx="28" ry="6" fill="rgba(0,0,0,0.3)"/>
  <path d="M 4 52 Q 32 12 60 52 Z" fill="#7d6849"/>
  <path d="M 12 52 Q 32 24 52 52 Z" fill="#9a8665"/>
</svg>`;

const ROCK = `<svg ${VB}>
  <ellipse cx="32" cy="50" rx="18" ry="3" fill="rgba(0,0,0,0.35)"/>
  <polygon points="14,48 22,28 40,22 52,38 48,50" fill="#6c6c6c"/>
  <polygon points="14,48 22,28 30,40 26,50" fill="#8a8a8a"/>
  <polygon points="40,22 52,38 44,40 38,30" fill="#5a5a5a"/>
</svg>`;

const BOULDER = `<svg ${VB}>
  <ellipse cx="32" cy="52" rx="22" ry="4" fill="rgba(0,0,0,0.35)"/>
  <path d="M 8 48 Q 4 28 24 18 Q 48 12 58 32 Q 60 50 32 52 Q 14 52 8 48 Z" fill="#6e6963"/>
  <path d="M 14 36 Q 24 22 40 22 Q 50 26 52 38" stroke="#3d3a36" stroke-width="2" fill="none"/>
</svg>`;

const MUSHROOM = `<svg ${VB}>
  <ellipse cx="32" cy="56" rx="10" ry="2" fill="rgba(0,0,0,0.3)"/>
  <rect x="28" y="36" width="8" height="18" fill="#e8d9b8"/>
  <ellipse cx="32" cy="36" rx="18" ry="10" fill="#9c2222"/>
  <circle cx="22" cy="32" r="2.5" fill="#fff"/>
  <circle cx="32" cy="28" r="2" fill="#fff"/>
  <circle cx="42" cy="32" r="2.5" fill="#fff"/>
</svg>`;

const FLOWER = `<svg ${VB}>
  <line x1="32" y1="56" x2="32" y2="36" stroke="#2f6a2c" stroke-width="3"/>
  <circle cx="32" cy="28" r="6" fill="#ff7ab8"/>
  <circle cx="22" cy="28" r="6" fill="#ff7ab8"/>
  <circle cx="42" cy="28" r="6" fill="#ff7ab8"/>
  <circle cx="32" cy="18" r="6" fill="#ff7ab8"/>
  <circle cx="32" cy="38" r="6" fill="#ff7ab8"/>
  <circle cx="32" cy="28" r="4" fill="#ffd24a"/>
</svg>`;

// ─────────────────────────────────────────── Furniture

const TABLE = `<svg ${VB}>
  <rect x="8" y="22" width="48" height="24" rx="3" fill="#7a4a22"/>
  <rect x="8" y="22" width="48" height="6" rx="2" fill="#9a6233"/>
  <rect x="12" y="46" width="6" height="14" fill="#5a3414"/>
  <rect x="46" y="46" width="6" height="14" fill="#5a3414"/>
</svg>`;

const CHAIR = `<svg ${VB}>
  <rect x="20" y="14" width="24" height="22" rx="2" fill="#7a4a22"/>
  <rect x="18" y="34" width="28" height="6" fill="#9a6233"/>
  <rect x="20" y="40" width="4" height="14" fill="#5a3414"/>
  <rect x="40" y="40" width="4" height="14" fill="#5a3414"/>
</svg>`;

const BED = `<svg ${VB}>
  <rect x="8" y="14" width="48" height="38" rx="3" fill="#5a3414"/>
  <rect x="12" y="22" width="40" height="22" rx="2" fill="#cfb89a"/>
  <rect x="14" y="24" width="20" height="14" rx="2" fill="#f0e2c8"/>
  <rect x="8" y="14" width="48" height="6" fill="#7a4a22"/>
  <rect x="8" y="48" width="48" height="6" fill="#7a4a22"/>
</svg>`;

const CHEST = `<svg ${VB}>
  <rect x="10" y="22" width="44" height="28" rx="2" fill="#7a4a22"/>
  <path d="M 10 22 Q 32 8 54 22" fill="#9a6233"/>
  <rect x="10" y="22" width="44" height="3" fill="#3a200a"/>
  <rect x="28" y="34" width="8" height="10" fill="#ffd24a"/>
  <circle cx="32" cy="38" r="1.6" fill="#3a200a"/>
</svg>`;

const BARREL = `<svg ${VB}>
  <ellipse cx="32" cy="14" rx="18" ry="5" fill="#7a4a22"/>
  <path d="M 14 14 Q 14 50 18 56 L 46 56 Q 50 50 50 14" fill="#9a6233"/>
  <ellipse cx="32" cy="14" rx="18" ry="5" fill="#3a200a"/>
  <line x1="14" y1="26" x2="50" y2="26" stroke="#3a200a" stroke-width="2"/>
  <line x1="14" y1="42" x2="50" y2="42" stroke="#3a200a" stroke-width="2"/>
</svg>`;

const TORCH = `<svg ${VB}>
  <rect x="30" y="22" width="4" height="36" fill="#5a3414"/>
  <ellipse cx="32" cy="20" rx="6" ry="10" fill="#ffb24a"/>
  <ellipse cx="32" cy="16" rx="3" ry="6" fill="#fff2c8"/>
  <ellipse cx="32" cy="20" rx="10" ry="14" fill="#ffb24a" opacity="0.25"/>
</svg>`;

const CAMPFIRE = `<svg ${VB}>
  <ellipse cx="32" cy="52" rx="18" ry="4" fill="rgba(0,0,0,0.4)"/>
  <line x1="14" y1="50" x2="50" y2="42" stroke="#5a3414" stroke-width="3"/>
  <line x1="50" y1="50" x2="14" y2="42" stroke="#5a3414" stroke-width="3"/>
  <ellipse cx="32" cy="36" rx="12" ry="14" fill="#ff5a1f"/>
  <ellipse cx="32" cy="34" rx="6" ry="10" fill="#ffd24a"/>
  <ellipse cx="32" cy="42" rx="16" ry="6" fill="#ff7a2a" opacity="0.4"/>
</svg>`;

// ─────────────────────────────────────────── Structure

const DOOR_FRONT = `<svg ${VB}>
  <rect x="14" y="8" width="36" height="48" rx="2" fill="#3a200a"/>
  <rect x="18" y="12" width="28" height="40" rx="2" fill="#7a4a22"/>
  <rect x="22" y="16" width="20" height="14" rx="2" fill="#9a6233"/>
  <rect x="22" y="34" width="20" height="14" rx="2" fill="#9a6233"/>
  <circle cx="40" cy="36" r="2" fill="#ffd24a"/>
</svg>`;

const STAIRS = `<svg ${VB}>
  <rect x="6" y="8" width="52" height="6" fill="#6c6c6c"/>
  <rect x="10" y="14" width="44" height="6" fill="#7a7a7a"/>
  <rect x="14" y="20" width="36" height="6" fill="#6c6c6c"/>
  <rect x="18" y="26" width="28" height="6" fill="#7a7a7a"/>
  <rect x="22" y="32" width="20" height="6" fill="#6c6c6c"/>
  <rect x="26" y="38" width="12" height="6" fill="#7a7a7a"/>
  <rect x="30" y="44" width="4" height="6" fill="#6c6c6c"/>
</svg>`;

const COLUMN = `<svg ${VB}>
  <rect x="20" y="10" width="24" height="6" fill="#cfc8b8"/>
  <rect x="22" y="16" width="20" height="40" fill="#e2dccb"/>
  <rect x="20" y="56" width="24" height="6" fill="#cfc8b8"/>
  <line x1="28" y1="20" x2="28" y2="52" stroke="#a89e88" stroke-width="1.5"/>
  <line x1="36" y1="20" x2="36" y2="52" stroke="#a89e88" stroke-width="1.5"/>
</svg>`;

const STATUE = `<svg ${VB}>
  <rect x="22" y="50" width="20" height="8" fill="#5d5853"/>
  <ellipse cx="32" cy="20" rx="6" ry="6" fill="#cfc8b8"/>
  <path d="M 22 50 Q 22 30 32 26 Q 42 30 42 50 Z" fill="#e2dccb"/>
</svg>`;

const WELL = `<svg ${VB}>
  <ellipse cx="32" cy="48" rx="20" ry="4" fill="rgba(0,0,0,0.35)"/>
  <ellipse cx="32" cy="42" rx="18" ry="6" fill="#6c6c6c"/>
  <ellipse cx="32" cy="42" rx="14" ry="4" fill="#1d2c4a"/>
  <rect x="14" y="20" width="4" height="22" fill="#5a3414"/>
  <rect x="46" y="20" width="4" height="22" fill="#5a3414"/>
  <rect x="12" y="16" width="40" height="6" fill="#7a4a22"/>
  <polygon points="12,16 32,6 52,16" fill="#9a3a1f"/>
</svg>`;

const TENT = `<svg ${VB}>
  <ellipse cx="32" cy="56" rx="22" ry="3" fill="rgba(0,0,0,0.35)"/>
  <polygon points="6,54 32,8 58,54" fill="#7a4a22"/>
  <polygon points="32,8 58,54 32,54" fill="#5a3414"/>
  <polygon points="32,54 24,30 32,18 40,30" fill="#1a1a1a"/>
</svg>`;

const THRONE = `<svg ${VB}>
  <rect x="14" y="8" width="36" height="48" rx="2" fill="#3d3a36"/>
  <rect x="18" y="14" width="28" height="32" fill="#9c2222"/>
  <rect x="14" y="46" width="36" height="6" fill="#5a3414"/>
  <rect x="14" y="44" width="6" height="14" fill="#3d3a36"/>
  <rect x="44" y="44" width="6" height="14" fill="#3d3a36"/>
  <polygon points="14,8 22,2 50,2 50,8" fill="#ffd24a"/>
</svg>`;

const ANVIL = `<svg ${VB}>
  <rect x="20" y="40" width="24" height="14" fill="#2a2a2a"/>
  <rect x="14" y="34" width="36" height="8" fill="#3a3a3a"/>
  <rect x="10" y="28" width="44" height="8" rx="2" fill="#4a4a4a"/>
  <polygon points="10,28 4,28 14,22" fill="#3a3a3a"/>
</svg>`;

// ─────────────────────────────────────────── Catalog

export const MAP_ASSETS: MapAsset[] = [
  { kind: "tree-oak", nameRu: "Дуб", category: "nature", svg: TREE_OAK },
  { kind: "tree-pine", nameRu: "Сосна", category: "nature", svg: TREE_PINE },
  { kind: "tree-birch", nameRu: "Берёза", category: "nature", svg: TREE_BIRCH },
  { kind: "bush", nameRu: "Куст", category: "nature", svg: BUSH },
  { kind: "mountain", nameRu: "Гора", category: "nature", svg: MOUNTAIN },
  { kind: "hill", nameRu: "Холм", category: "nature", svg: HILL },
  { kind: "rock", nameRu: "Камень", category: "nature", svg: ROCK },
  { kind: "boulder", nameRu: "Валун", category: "nature", svg: BOULDER },
  { kind: "mushroom", nameRu: "Гриб", category: "nature", svg: MUSHROOM },
  { kind: "flower", nameRu: "Цветок", category: "nature", svg: FLOWER },
  { kind: "table", nameRu: "Стол", category: "furniture", svg: TABLE },
  { kind: "chair", nameRu: "Стул", category: "furniture", svg: CHAIR },
  { kind: "bed", nameRu: "Кровать", category: "furniture", svg: BED },
  { kind: "chest", nameRu: "Сундук", category: "furniture", svg: CHEST },
  { kind: "barrel", nameRu: "Бочка", category: "furniture", svg: BARREL },
  { kind: "torch", nameRu: "Факел", category: "furniture", svg: TORCH },
  { kind: "campfire", nameRu: "Костёр", category: "furniture", svg: CAMPFIRE },
  { kind: "door-front", nameRu: "Дверь", category: "structure", svg: DOOR_FRONT },
  { kind: "stairs", nameRu: "Лестница", category: "structure", svg: STAIRS },
  { kind: "column", nameRu: "Колонна", category: "structure", svg: COLUMN },
  { kind: "statue", nameRu: "Статуя", category: "structure", svg: STATUE },
  { kind: "well", nameRu: "Колодец", category: "structure", svg: WELL },
  { kind: "tent", nameRu: "Палатка", category: "structure", svg: TENT },
  { kind: "throne", nameRu: "Трон", category: "decor", svg: THRONE },
  { kind: "anvil", nameRu: "Наковальня", category: "decor", svg: ANVIL },
];

export const MAP_ASSET_BY_KIND: Record<string, MapAsset> = Object.fromEntries(
  MAP_ASSETS.map((a) => [a.kind, a])
);

export const ASSET_CATEGORY_LABEL: Record<AssetCategory, string> = {
  nature: "Природа",
  furniture: "Мебель",
  structure: "Сооружения",
  decor: "Декор",
};
