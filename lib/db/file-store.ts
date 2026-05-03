import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Shared JSON-file persistence helper. Each "collection" is stored as a
 * single JSON array/object under `./.data/<name>.json` (relative to the
 * project root).
 *
 * Writes are serialised per collection via an async mutex so concurrent
 * requests can't clobber each other — important even in `next dev`, which
 * hot-reloads route handlers.
 *
 * This module is server-only. Importing it from a client component will
 * fail (no `node:fs`), which is exactly what we want — the client should
 * always go through `fetch('/api/…')`.
 */

const DATA_DIR = path.join(process.cwd(), ".data");

const locks = new Map<string, Promise<unknown>>();

async function withLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(name) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((r) => (release = r));
  // Capture the chained promise we actually store so the cleanup below
  // can compare against the same reference. `prev.then(...)` returns a
  // distinct Promise from `next`, so comparing against `next` always
  // failed and the Map kept growing.
  const chained = prev.then(() => next);
  locks.set(name, chained);
  try {
    await prev;
    return await fn();
  } finally {
    release();
    if (locks.get(name) === chained) locks.delete(name);
  }
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  await ensureDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      return fallback;
    }
    throw err;
  }
}

export async function writeJson<T>(name: string, value: T): Promise<void> {
  await ensureDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf-8");
  await fs.rename(tmp, file);
}

export async function updateJson<T>(
  name: string,
  fallback: T,
  mutator: (current: T) => T | Promise<T>
): Promise<T> {
  return withLock(name, async () => {
    const current = await readJson<T>(name, fallback);
    const next = await mutator(current);
    await writeJson(name, next);
    return next;
  });
}
