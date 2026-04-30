"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, UserCircle2 } from "lucide-react";
import * as React from "react";
import { NAV_LINKS, SITE } from "@/lib/constants/site";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    // Auto-close mobile menu on navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg font-bold tracking-wider text-foreground"
        >
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/40"
          >
            G
          </span>
          <span className="hidden sm:inline">{SITE.name}</span>
          <span className="sm:hidden">{SITE.shortName}</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                className="hidden items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                <UserCircle2 className="size-4" />
                {user.username}
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">
                  <LogIn className="size-4" />
                  Войти
                </Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/register">Регистрация</Link>
              </Button>
            </>
          )}

          <button
            type="button"
            aria-label="Меню"
            aria-expanded={open}
            className="grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border/60 bg-background/95 px-4 pb-4 pt-2 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => {
              const active =
                pathname === l.href ||
                (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
