export function getLatestQueuedWeight(session, exerciseId) {
  const queue = session?.weightQueues?.[exerciseId];
  if (!queue?.length) return null;
  return queue[queue.length - 1];
}

/**
 * Resolve a logged weight against the user's bodyweight.
 *
 * A negative weight represents assistance (e.g. assisted chin-ups make the
 * movement easier), so the effective load is the user's bodyweight minus the
 * assist. Given the assist is stored as a negative number, that is simply
 * `bodyweight + weight`. The result is clamped to a minimum of 0.
 *
 * Positive or zero weights are returned unchanged. If the weight is negative
 * but no bodyweight is available, the original value is returned so the caller
 * can decide how to handle the unresolved case.
 *
 * @param {number} weight - logged weight (may be negative for assistance)
 * @param {number|null} bodyweight - user's bodyweight in the same unit
 * @returns {number|null}
 */
export function resolveAssistedWeight(weight, bodyweight) {
  if (weight == null) return weight;
  const numeric = Number(weight);
  if (!Number.isFinite(numeric) || numeric >= 0) return numeric;

  if (bodyweight == null || !Number.isFinite(Number(bodyweight))) {
    return numeric;
  }

  return Math.max(0, Number(bodyweight) + numeric);
}

/** True if the item's unit is expressed in kilograms. */
export function unitIsKg(unit) {
  return typeof unit === "string" && unit.toLowerCase().startsWith("kg");
}

/** Standard Olympic bar weights used as a fallback when none is specified. */
export const DEFAULT_BAR_WEIGHT_KG = 20;
export const DEFAULT_BAR_WEIGHT_LB = 45;

/**
 * Resolve the bar weight to add for a bar-based exercise, in the item's unit.
 *
 * Uses the exercise's own `BarWeight` when set; otherwise falls back to the
 * standard Olympic bar (20 kg / 45 lb) matched to the item's unit. Returns 0
 * for non-bar exercises.
 *
 * @param {object} exercise - the exercise record (may have HasBar/BarWeight)
 * @param {string} unit - the item's weight unit (e.g. "lb", "kg")
 * @returns {number}
 */
export function barWeightForExercise(exercise, unit) {
  if (!exercise?.HasBar) return 0;

  const explicit = Number(exercise.BarWeight);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;

  return unitIsKg(unit) ? DEFAULT_BAR_WEIGHT_KG : DEFAULT_BAR_WEIGHT_LB;
}

/**
 * Pick the user's most recent bodyweight in the unit family matching `unit`.
 * Weight history entries store both `kg` and `lbs`.
 */
export function bodyweightForUnit(latestWeightEntry, unit) {
  if (!latestWeightEntry) return null;
  return unitIsKg(unit) ? latestWeightEntry.kg ?? null : latestWeightEntry.lbs ?? null;
}

export function withEffectiveWeight(item, session) {
  let result = item;

  // Apply weight override from weightQueues
  const latestWeight = getLatestQueuedWeight(session, item.exerciseId);
  if (latestWeight != null && item.Weight != null) {
    result = { ...result, Weight: latestWeight };
  }

  // Apply sets/reps overrides from exerciseOverrides
  const overrides = session?.exerciseOverrides?.[item.exerciseId];
  if (overrides) {
    result = result === item ? { ...result } : result;
    if (overrides.Sets != null) result.Sets = overrides.Sets;
    if (overrides.Reps != null) result.Reps = overrides.Reps;
  }

  return result;
}
