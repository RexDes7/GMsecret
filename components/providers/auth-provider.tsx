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

  // Refresh the cached session from the server on mount and on tab focus.
  // Without this, a demoted-or-banned user keeps their stale `role: admin`
  // in localStorage forever and the UI shows admin links it shouldn't.
  // The server is always the source of truth for role/banned/displayName.
  React.useEffect(() => {
    if (!hydrated) return;
    const cur = read();
    if (!cur) return;
    let cancelled = false;
    const refresh = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: {
            "x-user-id": cur.id,
            "x-user-name": cur.username,
            "x-user-role": cur.role,
          },
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 401) {
          // Session no longer valid on the server — sign out locally.
          signOut();
          return;
        }
        if (!res.ok) return;
        const profile = (await res.json()) as {
          id: string;
          username: string;
          email: string;
          role: "user" | "admin";
          banned?: boolean;
          displayName?: string;
          bio?: string;
          avatarUrl?: string;
        };
        if (profile.banned) {
          signOut();
          return;
        }
        // Only write back if anything actually changed — avoids loops.
        const next: SessionUser = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role,
          displayName: profile.displayName ?? cur.displayName,
          bio: profile.bio ?? cur.bio,
          avatarUrl: profile.avatarUrl ?? cur.avatarUrl,
        };
        if (
          next.id !== cur.id ||
          next.username !== cur.username ||
          next.email !== cur.email ||
          next.role !== cur.role ||
          next.displayName !== cur.displayName ||
          next.bio !== cur.bio ||
          next.avatarUrl !== cur.avatarUrl
        ) {
          signIn(next);
        }
      } catch {
        /* offline / network error — keep cached session */
      }
    };
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
    // We deliberately depend on `hydrated` and the user's id so the effect
    // only re-runs across login/logout events, not on every unrelated
    // re-render.
  }, [hydrated, user?.id, signIn, signOut]);

  const value = React.useMemo(
    () => ({ user, status, signIn, signOut }),
    [user, status, signIn, signOut]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return React.useContext(Ctx);
}
