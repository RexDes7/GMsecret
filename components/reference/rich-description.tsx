import {
  flattenToText,
  isListBlock,
  stripTtgMarkup,
} from "@/lib/reference/ttg-rich";

/**
 * Renders ttg.club description arrays. Each element is either a plain
 * paragraph string or a RichBlock (currently `list`). Inline tags are
 * stripped to plain text — interactive cross-links are TODO.
 */
export function RichDescription({
  content,
  className = "space-y-3 text-base leading-relaxed",
}: {
  content: unknown[] | undefined | null;
  className?: string;
}) {
  if (!content?.length) return null;
  return (
    <div className={className}>
      {content.map((node, i) => (
        <RichNode key={i} node={node} />
      ))}
    </div>
  );
}

function RichNode({ node }: { node: unknown }) {
  if (typeof node === "string") {
    const text = stripTtgMarkup(node);
    if (!text.trim()) return null;
    return <p>{text}</p>;
  }
  if (isListBlock(node)) {
    const ordered = node.attrs?.type === "ordered";
    const items = node.content ?? [];
    const ListTag = (ordered ? "ol" : "ul") as "ul" | "ol";
    return (
      <ListTag
        className={`${ordered ? "list-decimal" : "list-disc"} space-y-1 pl-5`}
      >
        {items.map((it, i) => (
          <li key={i}>
            {typeof it === "string" ? stripTtgMarkup(it) : flattenToText(it)}
          </li>
        ))}
      </ListTag>
    );
  }
  // Unknown shape — collapse to text.
  const fallback = flattenToText(node);
  if (!fallback.trim()) return null;
  return <p>{fallback}</p>;
}
