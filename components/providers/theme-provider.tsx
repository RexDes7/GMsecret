"use client";

import * as React from "react";

type ThemeContext = {
  theme: "dark";
};

const Ctx = React.createContext<ThemeContext>({ theme: "dark" });

/**
 * Single-theme provider: GM Secret House is dark-fantasy by design.
 * Wrapped as a provider so future light/system modes can be added without
 * touching consumer components.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={{ theme: "dark" }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return React.useContext(Ctx);
}
