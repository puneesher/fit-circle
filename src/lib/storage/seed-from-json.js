import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function readJsonSeed(collection) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${collection}.json`), "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}
