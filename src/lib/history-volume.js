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

/**
 * Total weight moved in a session, summed as sets × reps × weight per unit.
 * Weights can mix units (lb/kg) within a session, so totals are kept separate
 * per unit rather than added together.
 *
 * @returns {Array<{unit: string, total: number}>} one entry per unit, ordered
 *   by descending total.
 */
export function sessionTotalWeight(session) {
  if (session.status === "cancelled") return [];

  const byUnit = new Map();
  for (const item of session.completedItems) {
    const volume = exerciseVolume(item);
    if (volume === 0) continue;
    const unit = item.Unit ?? "";
    byUnit.set(unit, (byUnit.get(unit) ?? 0) + volume);
  }

  return Array.from(byUnit.entries())
    .map(([unit, total]) => ({ unit, total }))
    .sort((a, b) => b.total - a.total);
}

const LBS_PER_KG = 2.2046226218;

/** Format a total weight entry like "12,400 lb". */
export function formatTotalWeight({ unit, total }) {
  const rounded = Math.round(total).toLocaleString();
  return unit ? `${rounded} ${unit}` : rounded;
}

/**
 * Convert a total weight entry to the other unit (lb <-> kg), for showing a
 * grayed-out equivalent. Returns null when the unit isn't lb/kg.
 */
export function convertTotalWeight({ unit, total }) {
  const u = (unit ?? "").toLowerCase();
  if (u.startsWith("lb")) {
    return { unit: "kg", total: total / LBS_PER_KG };
  }
  if (u.startsWith("kg")) {
    return { unit: "lb", total: total * LBS_PER_KG };
  }
  return null;
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
