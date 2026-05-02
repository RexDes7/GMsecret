"use client";

import * as React from "react";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  bio?: string;
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
 * External store for the session, backed by localStorage. Using
 * useSyncExternalStore lets us avoid setting React state inside an effect
 * (the React 19 lint rule react-hooks/set-state-in-effect) while still
 * supporting SSR — the server snapshot is `null` and hydration switches to
 * the persisted user without flicker.
 */

let cached: SessionUser | null = null;
let cachedRaw: string | null = null;

function read(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    cached = raw ? (JSON.parse(raw) as SessionUser) : null;
    return cached;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
function emit() {
  // Invalidate both cache slots — when localStorage is cleared the new raw
  // value is `null`, which would otherwise compare equal to a stale
  // `cachedRaw` and cause `read()` to return the previous user reference.
  cached = null;
  cachedRaw = null;
  for (const cb of listeners) cb();
}

function getServerSnapshot(): SessionUser | null {
  return null;
}

/**
 * Lightweight client-side session store. This is a stand-in for NextAuth.js;
 * it persists a "session user" in localStorage so guards/UI can be developed
 * before MongoDB and NextAuth are wired up.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = React.useSyncExternalStore(subscribe, read, getServerSnapshot);
  // useSyncExternalStore returns the server snapshot during SSR and the very
  // first hydration commit, then switches to the client snapshot. We mirror
  // that behaviour here to expose a "loading" status until hydration finishes
  // — that prevents AuthGuard from redirecting on the transient null state.
  const hydrated = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const status: AuthContext["status"] = !hydrated
    ? "loading"
    : user
      ? "authenticated"
      : "unauthenticated";

  const signIn = React.useCallback((next: SessionUser) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore storage failures */
    }
    emit();
  }, []);

  const signOut = React.useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    emit();
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
