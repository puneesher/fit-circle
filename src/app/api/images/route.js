import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const ALLOWED_EXTS = new Set([".gif", ".jpg", ".jpeg", ".png", ".webp", ".svg"]);

export async function GET() {
  const entries = await fs.readdir(IMAGES_DIR, { withFileTypes: true });

  const images = entries
    .filter((e) => e.isFile() && ALLOWED_EXTS.has(path.extname(e.name).toLowerCase()))
    .map((e) => `/images/${e.name}`)
    .sort((a, b) => a.localeCompare(b));

  return NextResponse.json(images);
}
