function weightMultiplier(prefix) {
  if (!prefix) return 1;

  const match = String(prefix).match(/^(\d+)×/);
  return match ? Number(match[1]) : 1;
}

export function exerciseVolume(item) {
  if (item.Weight == null || item.Sets == null || item.Reps == null) {
    return 0;
  }

  const weight = item.Weight * weightMultiplier(item.Prefix);
  return item.Sets * item.Reps * weight;
}

export function sessionVolume(session) {
  if (session.status === "cancelled") return 0;

  return session.completedItems.reduce(
    (total, item) => total + exerciseVolume(item),
    0,
  );
}

export function dailyVolumeFromHistory(history) {
  const byDate = new Map();

  for (const session of history) {
    const volume = sessionVolume(session);
    if (volume === 0) continue;

    byDate.set(session.date, (byDate.get(session.date) ?? 0) + volume);
  }

  return Array.from(byDate.entries())
    .map(([date, volume]) => ({ date, volume }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function formatVolume(volume) {
  return Math.round(volume).toLocaleString();
}

export function formatChartDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
