"use client";

import type { SessionUser } from "@/components/providers/auth-provider";
import type { UserProfile, UserProfilePatch } from "@/lib/db/repository";
import { apiFetch } from "@/lib/services/api-client";

export type PublicUserProfile = Omit<UserProfile, "email">;

export const UserClient = {
  async me(user: SessionUser): Promise<UserProfile> {
    return apiFetch<UserProfile>("/api/users/me", { user });
  },

  async ensure(user: SessionUser, email: string): Promise<UserProfile> {
    return apiFetch<UserProfile>("/api/users/me", {
      method: "POST",
      user,
      body: { email },
    });
  },

  async patchMe(
    user: SessionUser,
    patch: UserProfilePatch
  ): Promise<UserProfile> {
    return apiFetch<UserProfile>("/api/users/me", {
      method: "PATCH",
      user,
      body: patch,
    });
  },

  async byUsername(username: string): Promise<PublicUserProfile | null> {
    try {
      return await apiFetch<PublicUserProfile>(
        `/api/users/${encodeURIComponent(username)}`
      );
    } catch (e) {
      if ((e as Error).message === "not_found") return null;
      throw e;
    }
  },

  /**
   * Resolve the canonical id/username for an email so login can rehydrate
   * the original session identity (instead of deriving a brand-new id from
   * the email local part on every login).
   */
  async lookupByEmail(
    email: string
  ): Promise<{ id: string; username: string; role: "user" | "admin" } | null> {
    try {
      return await apiFetch<{
        id: string;
        username: string;
        role: "user" | "admin";
      }>(`/api/users/lookup?email=${encodeURIComponent(email)}`);
    } catch (e) {
      if ((e as Error).message === "not_found") return null;
      throw e;
    }
  },
};
