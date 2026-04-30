"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useAuth } from "@/components/providers/auth-provider";

type Props = {
  children: React.ReactNode;
  /** Redirect target when unauthenticated. Defaults to /login. */
  fallback?: string;
  /** Required role; e.g. "admin" for admin routes. */
  role?: "admin";
};

/**
 * Client-side guard that redirects unauthenticated users (or users without
 * the required role) to the fallback page.
 */
export function AuthGuard({ children, fallback = "/login", role }: Props) {
  const router = useRouter();
  const { user, status } = useAuth();

  React.useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace(fallback);
      return;
    }
    if (role && user.role !== role) {
      router.replace("/");
    }
  }, [user, status, router, fallback, role]);

  if (status === "loading" || !user || (role && user.role !== role)) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-sm text-muted-foreground">
        Проверка доступа…
      </div>
    );
  }

  return <>{children}</>;
}
