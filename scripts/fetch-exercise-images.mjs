import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const imagesDir = path.join(root, "public", "images");
const exercisesPath = path.join(root, "data", "exercises.json");

/** fitnessprogramer.com exercise slug per exercise _id */
const MAPPING = {
  "lateral-raise": "dumbbell-lateral-raise",
  "mts-individual-biceps-curl": "lever-preacher-curl",
  "triceps-extension": "rope-pushdown",
  "seated-concentration-curl": "concentration-curl",
  "mts-shoulder-press": "lever-shoulder-press",
  bells: "dumbbell-curl",
  "triceps-press": "close-grip-bench-press",
  "new-individual-biceps-curl": "hammer-curl",
  "assisted-dip": "bench-dips",
  "assisted-chin": "chin-up",
  "bench-chest-press": "bench-press",
  "mts-front-pulldown": "lat-pulldown",
  "mts-chest-press": "chest-press-machine",
  "rear-deltoid": "bent-over-lateral-raise",
  "pectoral-fly": "dumbbell-fly",
  "mts-high-row": "lever-high-row",
  "mts-declined-press": "decline-barbell-bench-press",
  "mts-row": "seated-row-machine",
  "dual-cable-cross": "cable-crossover",
  "front-pulldown": "close-grip-lat-pulldown",
  "mts-inclined-press": "incline-chest-press-machine",
  "cable-row": "seated-cable-row",
  "inclined-bench-press": "incline-barbell-bench-press",
  "dual-pulley-row": "seated-cable-row",
  glute: "glute-kickback-machine",
  "leg-curl": "leg-curl",
  "seated-leg-press": "leg-press",
  "hip-adduction": "hip-adduction-machine",
  "hip-abduction": "hip-abduction-machine",
  "calf-extension": "standing-calf-raise",
  "leg-extension": "leg-extension",
  abdominal: "crunch",
  "forward-step": "barbell-lunge",
  "seated-leg-curl": "seated-leg-curl",
  "knee-flexion": "leg-curl",
  "hip-glute": "smith-machine-hip-thrust",
  "individual-kneeling-leg-curl": "seated-leg-curl",
  "bench-press": "bench-press",
  "lat-pulldown": "lat-pulldown",
  "leg-press": "leg-press",
};

async function fetchGifUrl(slug) {
  const pageUrl = `https://fitnessprogramer.com/exercise/${slug}/`;
  const response = await fetch(pageUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${slug}`);
  }

  const html = await response.text();
  const match = html.match(/wp-content\/uploads\/[^"']+\.gif/i);

  if (!match) {
    throw new Error(`No GIF found for ${slug}`);
  }

  return `https://fitnessprogramer.com/${match[0]}`;
}

async function download(url, dest) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(dest, buffer);
}

const exercises = JSON.parse(await fs.readFile(exercisesPath, "utf-8"));
await fs.mkdir(imagesDir, { recursive: true });

const slugCache = new Map();
const missing = exercises.filter((exercise) => !MAPPING[exercise._id]);

if (missing.length > 0) {
  console.error(
    "Missing fitnessprogramer mapping for:",
    missing.map((exercise) => exercise._id).join(", "),
  );
  process.exit(1);
}

for (const exercise of exercises) {
  const slug = MAPPING[exercise._id];
  const filename = `${exercise._id}.gif`;
  const dest = path.join(imagesDir, filename);

  if (!slugCache.has(slug)) {
    const gifUrl = await fetchGifUrl(slug);
    await download(gifUrl, dest);
    slugCache.set(slug, dest);
    console.log(`Downloaded ${filename} <- ${slug}`);
  } else {
    await fs.copyFile(slugCache.get(slug), dest);
    console.log(`Copied ${filename} <- ${slug}`);
  }

  exercise.Picture = `/images/${filename}`;
}

await fs.writeFile(exercisesPath, `${JSON.stringify(exercises, null, 2)}\n`, "utf-8");
console.log(`\nDone: ${exercises.length} exercises -> /images/{id}.gif`);
