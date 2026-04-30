"use client";

import * as React from "react";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  role: "user" | "admin";
};

type AuthContext = {
  user: SessionUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (user: SessionUser) => void;
  signOut: () => void;
};

const Ctx = React.createContext<AuthContext>({
  user: null,
  status: "unauthenticated",
  signIn: () => {},
  signOut: () => {},
});

const STORAGE_KEY = "gm-secret-house:session";

/**
 * Lightweight client-side session store. This is a stand-in for NextAuth.js;
 * it persists a "session user" in localStorage so guards/UI can be developed
 * before MongoDB and NextAuth are wired up.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [status, setStatus] = React.useState<AuthContext["status"]>("loading");

  React.useEffect(() => {
    // Hydrate from localStorage on mount. localStorage isn't available during
    // SSR, so we must read it in an effect.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as SessionUser);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    } catch {
      setStatus("unauthenticated");
    }
  }, []);

  const signIn = React.useCallback((next: SessionUser) => {
    setUser(next);
    setStatus("authenticated");
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore storage failures */
    }
  }, []);

  const signOut = React.useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo(
    () => ({ user, status, signIn, signOut }),
    [user, status, signIn, signOut]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return React.useContext(Ctx);
}
