export function formatSessionDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSessionTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function sessionStatusLabel(status) {
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  if (status === "active") return "In progress";
  return status;
}

export function sessionStatusClass(status) {
  if (status === "completed") {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
  }

  if (status === "cancelled") {
    return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
  }

  if (status === "active") {
    return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200";
  }

  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
}
