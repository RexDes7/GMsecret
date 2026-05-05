import "server-only";
import { readJson, updateJson } from "@/lib/db/file-store";
import type {
  IMapFontRepository,
  MapFont,
  MapFontInput,
} from "@/lib/db/repository";

const FILE = "map-fonts";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export class FileMapFontRepository implements IMapFontRepository {
  async list(): Promise<MapFont[]> {
    const arr = await readJson<MapFont[]>(FILE, []);
    return arr.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async get(id: string): Promise<MapFont | undefined> {
    const arr = await readJson<MapFont[]>(FILE, []);
    return arr.find((a) => a.id === id);
  }

  async getBySlug(slug: string): Promise<MapFont | undefined> {
    const arr = await readJson<MapFont[]>(FILE, []);
    const lower = slug.toLowerCase();
    return arr.find((a) => a.slug.toLowerCase() === lower);
  }

  async create(input: MapFontInput): Promise<MapFont> {
    const now = new Date().toISOString();
    const record: MapFont = {
      id: input.id ?? uid(),
      slug: input.slug,
      nameRu: input.nameRu,
      fileUrl: input.fileUrl,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      createdAt: input.createdAt ?? now,
      createdBy: input.createdBy,
    };
    await updateJson<MapFont[]>(FILE, [], (list) => [...list, record]);
    return record;
  }

  async delete(id: string): Promise<boolean> {
    let removed = false;
    await updateJson<MapFont[]>(FILE, [], (list) => {
      const next = list.filter((a) => a.id !== id);
      removed = next.length < list.length;
      return next;
    });
    return removed;
  }
}
