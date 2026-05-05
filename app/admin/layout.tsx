"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";

const NAV: Array<{ href: string; label: string }> = [
  { href: "/admin", label: "Дэшборд" },
  { href: "/admin/content", label: "Контент" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/map-assets", label: "Ассеты карт" },
  { href: "/admin/map-fonts", label: "Шрифты карт" },
  { href: "/admin/analytics", label: "Аналитика" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard role="admin">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <AdminNav />
          <section>{children}</section>
        </div>
      </div>
    </AuthGuard>
  );
}

function AdminNav() {
  const pathname = usePathname();
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Админ-панель
      </h2>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "rounded-md px-3 py-2 text-sm transition-colors " +
                (active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-muted/40")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
