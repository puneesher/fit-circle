export function bookRowId(item, index) {
  const slug = `${item.title}-${item.author}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

  return slug || `book-${index}`;
}
