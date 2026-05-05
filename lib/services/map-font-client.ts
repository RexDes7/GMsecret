"use client";

import type { SessionUser } from "@/components/providers/auth-provider";
import type { MapFont } from "@/lib/db/repository";
import { apiFetch } from "@/lib/services/api-client";
import { registerCustomMapFonts } from "@/lib/maps/fonts";

export const MapFontClient = {
  async list(): Promise<MapFont[]> {
    const res = await apiFetch<{ items: MapFont[] }>("/api/map-fonts");
    registerCustomMapFonts(
      res.items.map((f) => ({
        slug: f.slug,
        fileUrl: f.fileUrl,
        mimeType: f.mimeType,
      }))
    );
    return res.items;
  },

  async upload(
    user: SessionUser,
    args: { file: File; slug: string; nameRu: string }
  ): Promise<MapFont> {
    const form = new FormData();
    form.append("file", args.file);
    form.append("slug", args.slug);
    form.append("nameRu", args.nameRu);
    const res = await fetch("/api/admin/map-fonts", {
      method: "POST",
      headers: {
        "x-user-id": user.id,
        "x-user-name": user.username,
        "x-user-role": user.role,
      },
      body: form,
    });
    if (!res.ok) {
      let message = `Загрузка шрифта не удалась (${res.status})`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) message = body.error;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    return (await res.json()) as MapFont;
  },

  async remove(user: SessionUser, id: string): Promise<void> {
    await apiFetch<{ ok: true }>(
      `/api/admin/map-fonts/${encodeURIComponent(id)}`,
      { method: "DELETE", user }
    );
  },
};
