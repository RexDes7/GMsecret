import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/lib/constants/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-background/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg font-bold tracking-wider">
              <span
                aria-hidden
                className="grid size-7 place-items-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/40"
              >
                G
              </span>
              {SITE.name}
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              {SITE.description}
            </p>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      className="text-sm text-foreground/80 hover:text-primary"
                      href={it.href}
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Все права защищены.
          </p>
          <p>
            D&D — товарный знак Wizards of the Coast. Этот сайт не является
            аффилированным продуктом.
          </p>
        </div>
      </div>
    </footer>
  );
}
