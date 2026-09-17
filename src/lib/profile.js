export const KG_TO_LBS = 2.2046226218;

/** Convert kilograms to pounds, rounded to one decimal. */
export function kgToLbs(kg) {
  const value = Number(kg);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * KG_TO_LBS * 10) / 10;
}

export const SEX_OPTIONS = ["male", "female", "other"];

/**
 * Build a single weight entry from a kg value.
 * Stores both units plus the date so weight history can be tracked over time.
 */
export function makeWeightEntry(kg, date = new Date()) {
  const value = Number(kg);
  if (!Number.isFinite(value) || value <= 0) return null;

  const roundedKg = Math.round(value * 10) / 10;
  const isoDate =
    date instanceof Date ? date.toISOString() : new Date(date).toISOString();

  return {
    date: isoDate,
    kg: roundedKg,
    lbs: kgToLbs(roundedKg),
  };
}

/** Append a weight entry to an existing (possibly missing) weight array. */
export function appendWeightEntry(weightHistory, kg, date = new Date()) {
  const entry = makeWeightEntry(kg, date);
  if (!entry) return Array.isArray(weightHistory) ? weightHistory : [];

  const history = Array.isArray(weightHistory) ? [...weightHistory] : [];
  history.push(entry);
  return history;
}

/** Return the most recent weight entry, or null if none. */
export function latestWeight(weightHistory) {
  if (!Array.isArray(weightHistory) || weightHistory.length === 0) return null;
  return [...weightHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  )[0];
}
