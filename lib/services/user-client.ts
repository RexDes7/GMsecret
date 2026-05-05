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

};
