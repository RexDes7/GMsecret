/**
 * Whitelist same-origin, in-app redirect targets read from query strings.
 *
 * Without validation, `?redirect=…` is a classic open-redirect vector —
 * a crafted `/login?redirect=https://evil.example` would phish the user
 * right after sign-in. We accept only paths that start with a single `/`
 * and are not protocol-relative (`//host/…`) or otherwise ambiguous.
 */
export function isSafeRedirect(value: string | null | undefined): boolean {
  if (!value) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false;
  // Reject backslash-smuggled protocol-relative URLs that some browsers
  // normalise to `//` (e.g. `/\evil.example`).
  if (value.startsWith("/\\")) return false;
  return true;
}

export function safeRedirect(
  value: string | null | undefined,
  fallback: string
): string {
  return isSafeRedirect(value) ? (value as string) : fallback;
}
