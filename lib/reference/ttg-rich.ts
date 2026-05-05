/**
 * Helpers for rendering ttg.club's rich-content shape.
 *
 * Description fields come back as an array of mixed `string | RichBlock`.
 * Strings are paragraphs, RichBlocks describe lists / tables / nested
 * structure. We currently support strings and unordered/ordered lists; any
 * unknown block is collapsed to plain text via `flattenToText`.
 *
 * Inline tags inside strings ({@i ...}, {@b ...}, {@spell ...|spell:...}, etc.)
 * are stripped to their visible text. The format is `{@token text|target}`.
 */

export type RichListBlock = {
  type: "list";
  attrs?: { type?: "unordered" | "ordered" };
  content?: unknown[];
};

export type RichBlock = RichListBlock | { type: string; [k: string]: unknown };

const TAG_RE = /\{@([a-zA-Z]+)\s+([^|}]+)(?:\|[^}]*)?\}/g;

export function stripTtgMarkup(text: string): string {
  return text.replace(TAG_RE, (_, _tag, content) => content);
}

export function flattenToText(node: unknown): string {
  if (typeof node === "string") return stripTtgMarkup(node);
  if (Array.isArray(node)) return node.map(flattenToText).join(" ");
  if (node && typeof node === "object" && "content" in node) {
    return flattenToText((node as RichBlock).content);
  }
  return "";
}

export function isListBlock(node: unknown): node is RichListBlock {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as { type?: string }).type === "list"
  );
}

/**
 * Tries to extract a plain-text excerpt of `maxLen` chars from a description
 * tree, useful for SEO/meta or list previews.
 */
export function excerpt(content: unknown, maxLen = 200): string {
  const flat = Array.isArray(content)
    ? content.map(flattenToText).join(" ")
    : flattenToText(content);
  const trimmed = flat.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen - 1).trimEnd() + "…";
}
