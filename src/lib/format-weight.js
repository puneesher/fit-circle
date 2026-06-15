export function formatWeight(item) {
  if (item.Weight == null) return null;

  const value = `${item.Prefix ?? ""}${item.Weight}`;
  return item.Unit ? `${value} ${item.Unit}` : value;
}

export function typeBadgeClass(type) {
  if (type === "Push") {
    return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200";
  }

  if (type === "Pull" || type === "Pull-front") {
    return "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200";
  }

  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
}
