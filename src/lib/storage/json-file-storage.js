import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

/**
 * JSON file storage adapter.
 *
 * Reads work on Vercel (files are bundled at deploy time).
 * Writes persist locally in dev, but NOT on Vercel serverless — the
 * filesystem is read-only except /tmp (ephemeral). Swap this adapter
 * for a database or blob store when you need production writes.
 */
export function createJsonFileStorage(collection) {
  const filePath = path.join(DATA_DIR, `${collection}.json`);

  return {
    async readAll() {
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        return JSON.parse(raw);
      } catch (err) {
        if (err.code === "ENOENT") return [];
        throw err;
      }
    },

    async writeAll(items) {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf-8");
      return items;
    },
  };
}
