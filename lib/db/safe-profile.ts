import "server-only";
import type { UserProfile } from "@/lib/db/repository";

/**
 * Strips fields that should never leave the server (`passwordHash`) from a
 * persisted user profile before sending it to the client. Use this in every
 * route that responds with a `UserProfile` — including the authenticated
 * `/api/users/me`, the public `/api/users/[username]`, the admin lists, and
 * the auth login/register endpoints.
 */
export type SafeUserProfile = Omit<UserProfile, "passwordHash">;

export function stripHash(profile: UserProfile): SafeUserProfile {
  const { passwordHash: _hash, ...safe } = profile;
  void _hash;
  return safe;
}

/** Strips the email too — for endpoints anyone can hit. */
export function stripPublicSensitive(
  profile: UserProfile
): Omit<SafeUserProfile, "email"> {
  const { passwordHash: _hash, email: _email, ...safe } = profile;
  void _hash;
  void _email;
  return safe;
}
