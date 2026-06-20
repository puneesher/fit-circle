import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function readJsonSeed(collection) {
  const filePath = path.join(DATA_DIR, `${collection}.json`);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    if (!raw.trim()) {
      throw new Error(`${filePath} is empty — save the file or add JSON content`);
    }
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}
