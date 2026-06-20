import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { bookRowId } from "../src/lib/books.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const booksPath = path.join(root, "data", "books.json");
const imagesDir = path.join(root, "public", "images", "books");

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

function fullCoverUrl(thumbnailUrl) {
  return thumbnailUrl.replace(/\._S[^.]+_/g, "");
}

async function coverFromBookPage(bookId) {
  const url = `https://www.goodreads.com/book/show/${bookId}`;
  const response = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });

  if (!response.ok) return null;

  const html = await response.text();
  const match = html.match(/<meta property="og:image" content="([^"]+)"/);
  return match?.[1] ?? null;
}

function searchQuery(book) {
  return book.title.trim();
}

function isNoise(result) {
  const title = result.title?.toLowerCase() ?? "";
  return /summary|book review|study guide|novel-ties|analysis|trivia|quiz|workbook|lesson plan|sidekick|bookbuddy|bookrags|expert book reviews|elite summaries/.test(
    title,
  );
}

function pickBestMatch(book, results) {
  const pool = results.filter((result) => !isNoise(result));
  const candidates = pool.length > 0 ? pool : results;
  const title = book.title.trim().toLowerCase();
  const lastName = book.author?.split(",")[0]?.trim().toLowerCase() ?? "";

  const exact = candidates.find(
    (result) =>
      result.bookTitleBare?.toLowerCase() === title ||
      result.title?.toLowerCase() === title,
  );
  if (exact) return exact;

  const byAuthor = candidates.find((result) =>
    result.author?.name?.toLowerCase().includes(lastName),
  );
  if (byAuthor) return byAuthor;

  const startsWith = candidates.find((result) =>
    result.title?.toLowerCase().startsWith(title),
  );
  if (startsWith) return startsWith;

  return candidates[0];
}

async function lookupGoodreads(book) {
  const query = encodeURIComponent(searchQuery(book));
  const url = `https://www.goodreads.com/book/auto_complete?format=json&q=${query}`;
  const response = await fetch(url, { headers: { "User-Agent": UA } });

  if (!response.ok) {
    throw new Error(`Goodreads lookup failed (${response.status}): ${book.title}`);
  }

  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`No Goodreads match for: ${book.title}`);
  }

  return pickBestMatch(book, results);
}

async function download(url, dest) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Referer: "https://www.goodreads.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(dest, buffer);
}

const books = JSON.parse(await fs.readFile(booksPath, "utf-8"));
await fs.mkdir(imagesDir, { recursive: true });

for (let index = 0; index < books.length; index += 1) {
  const book = books[index];
  const id = bookRowId(book, index);
  const dest = path.join(imagesDir, `${id}.jpg`);

  const match = await lookupGoodreads(book);
  let coverUrl = fullCoverUrl(match.imageUrl);

  if (coverUrl.includes("goodreads_wide") || coverUrl.includes("facebook")) {
    coverUrl = await coverFromBookPage(match.bookId);
  }

  if (!coverUrl) {
    throw new Error(`No cover URL for: ${book.title}`);
  }

  try {
    await download(coverUrl, dest);
  } catch {
    const fallback = await coverFromBookPage(match.bookId);
    if (!fallback) throw new Error(`No cover for: ${book.title}`);
    coverUrl = fallback;
    await download(coverUrl, dest);
  }

  book.goodreads_id = Number(match.bookId);
  book.Picture = `/images/books/${id}.jpg`;

  console.log(`Downloaded ${book.title} <- ${coverUrl}`);

  await new Promise((resolve) => setTimeout(resolve, 400));
}

await fs.writeFile(booksPath, `${JSON.stringify(books, null, 2)}\n`, "utf-8");
console.log(`\nUpdated ${books.length} books in data/books.json`);
