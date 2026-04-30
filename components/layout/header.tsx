"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, UserCircle2 } from "lucide-react";
import * as React from "react";
import { NAV_LINKS } from "@/lib/constants/site";
import { useAuth } from "@/components/providers/auth-provider";
import { GmLogo } from "@/components/brand/logo";
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
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="GM Secret House — на главную">
          <GmLogo />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium uppercase tracking-[0.18em] transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/community"
            className="ml-2 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-foreground/90 transition-colors hover:border-primary/60 hover:text-primary"
          >
            Неведомый мир?
            <span aria-hidden className="text-primary">
              ↗
            </span>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                <UserCircle2 className="size-4" />
                {user.username}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full bg-foreground px-5 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-background transition-colors hover:bg-foreground/90"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden rounded-full px-3 py-1.5 text-sm uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Регистрация
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-foreground px-5 py-1.5 text-sm font-semibold uppercase tracking-[0.18em] text-background transition-colors hover:bg-foreground/90"
              >
                Вход
              </Link>
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
                pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm uppercase tracking-[0.18em]",
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
            <li>
              <Link
                href="/community"
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-xs uppercase tracking-[0.2em]"
              >
                Неведомый мир?
                <span aria-hidden className="text-primary">
                  ↗
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
