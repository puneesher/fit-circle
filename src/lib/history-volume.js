export function exerciseVolume(item) {
  if (item.Weight == null || item.Sets == null || item.Reps == null) {
    return 0;
  }

  const multiplier = item.Unilateral ? 2 : 1;
  return item.Sets * item.Reps * item.Weight * multiplier;
}

export function sessionVolume(session) {
  if (session.status === "cancelled") return 0;

  return session.completedItems.reduce(
    (total, item) => total + exerciseVolume(item),
    0,
  );
}

const MAX_CHART_DAYS = 30;

export function dailyVolumeFromHistory(history) {
  const byDate = new Map();

  for (const session of history) {
    const volume = sessionVolume(session);
    if (volume === 0) continue;

    byDate.set(session.date, (byDate.get(session.date) ?? 0) + volume);
  }

  return Array.from(byDate.entries())
    .map(([date, volume]) => ({ date, volume }))
    .sort((a, b) => b.date.localeCompare(a.date)) // newest first
    .slice(0, MAX_CHART_DAYS); // latest bar is first (leftmost)
}

export function formatVolume(volume) {
  if (volume >= 1000) {
    return `${Math.round(volume / 1000)}K`;
  }
  return Math.round(volume).toLocaleString();
}

export function formatChartDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
  });
}
