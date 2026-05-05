"use client";

import type { SessionUser } from "@/components/providers/auth-provider";
import type { MapAsset } from "@/lib/db/repository";
import { apiFetch } from "@/lib/services/api-client";
import { registerCustomMapAssets } from "@/lib/maps/renderer";

export const MapAssetClient = {
  async list(): Promise<MapAsset[]> {
    const res = await apiFetch<{ items: MapAsset[] }>("/api/map-assets");
    registerCustomMapAssets(
      res.items.map((a) => ({ id: a.id, fileUrl: a.fileUrl }))
    );
    return res.items;
  },

  async upload(
    user: SessionUser,
    args: {
      file: File;
      slug: string;
      nameRu: string;
      category: MapAsset["category"];
    }
  ): Promise<MapAsset> {
    const form = new FormData();
    form.append("file", args.file);
    form.append("slug", args.slug);
    form.append("nameRu", args.nameRu);
    form.append("category", args.category);
    const res = await fetch("/api/admin/map-assets", {
      method: "POST",
      headers: {
        "x-user-id": user.id,
        "x-user-name": user.username,
        "x-user-role": user.role,
      },
      body: form,
    });
    if (!res.ok) {
      let message = `Загрузка не удалась (${res.status})`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) message = body.error;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    return (await res.json()) as MapAsset;
  },

  async remove(user: SessionUser, id: string): Promise<void> {
    await apiFetch<{ ok: true }>(
      `/api/admin/map-assets/${encodeURIComponent(id)}`,
      { method: "DELETE", user }
    );
  },
};
