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
    <header className="sticky top-3 z-40 px-3 sm:top-5 sm:px-6">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-7xl items-center gap-3 rounded-2xl px-4 sm:h-16 sm:px-6",
          // Glass plate: tinted dark crimson, blurred backdrop, hairline
          // border + soft drop shadow so it floats above the hero video.
          "border border-white/10 bg-[rgba(40,8,12,0.55)] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(40,8,12,0.42)]"
        )}
      >
        <Link
          href="/"
          aria-label="GM Secret House — на главную"
          className="shrink-0"
        >
          <GmLogo />
        </Link>

        {/* Center cluster: navigation + Неведомый мир pill */}
        <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
          {NAV_LINKS.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition-colors",
                  active
                    ? "text-foreground"
                    : "text-foreground/85 hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/community"
            className="ml-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-foreground/95 transition-colors hover:border-primary/60 hover:bg-white/10"
          >
            Неведомый мир?
            <span aria-hidden className="text-primary">
              ↗
            </span>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          {user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-foreground/85 hover:bg-white/5 hover:text-foreground sm:inline-flex"
              >
                <UserCircle2 className="size-4" />
                {user.username}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 pl-[calc(1.25rem+0.18em)] text-xs font-bold uppercase leading-none tracking-[0.18em] text-background transition-colors hover:bg-foreground/90"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="hidden text-xs font-semibold uppercase tracking-[0.22em] text-foreground/85 transition-colors hover:text-foreground sm:inline-flex"
              >
                Регистрация
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 pl-[calc(1.25rem+0.22em)] text-xs font-bold uppercase leading-none tracking-[0.22em] text-background transition-colors hover:bg-foreground/90"
              >
                Вход
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label="Меню"
            aria-expanded={open}
            className="grid size-9 place-items-center rounded-lg text-foreground/85 hover:bg-white/5 hover:text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="mx-auto mt-2 max-w-7xl rounded-2xl border border-white/10 bg-[rgba(40,8,12,0.85)] px-4 pb-4 pt-3 backdrop-blur-md md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => {
              const active =
                pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm uppercase tracking-[0.18em]",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/85 hover:bg-white/5 hover:text-foreground"
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
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em]"
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
