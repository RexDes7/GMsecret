import "server-only";
import { readJson, updateJson } from "@/lib/db/file-store";
import type {
  IMapAssetRepository,
  MapAsset,
  MapAssetInput,
} from "@/lib/db/repository";

const FILE = "map-assets";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export class FileMapAssetRepository implements IMapAssetRepository {
  async list(): Promise<MapAsset[]> {
    const arr = await readJson<MapAsset[]>(FILE, []);
    return arr.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async get(id: string): Promise<MapAsset | undefined> {
    const arr = await readJson<MapAsset[]>(FILE, []);
    return arr.find((a) => a.id === id);
  }

  async create(input: MapAssetInput): Promise<MapAsset> {
    const now = new Date().toISOString();
    const record: MapAsset = {
      id: input.id ?? uid(),
      slug: input.slug,
      nameRu: input.nameRu,
      category: input.category,
      fileUrl: input.fileUrl,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      createdAt: input.createdAt ?? now,
      createdBy: input.createdBy,
    };
    await updateJson<MapAsset[]>(FILE, [], (list) => [...list, record]);
    return record;
  }

  async delete(id: string): Promise<boolean> {
    let removed = false;
    await updateJson<MapAsset[]>(FILE, [], (list) => {
      const next = list.filter((a) => a.id !== id);
      removed = next.length < list.length;
      return next;
    });
    return removed;
  }
}
