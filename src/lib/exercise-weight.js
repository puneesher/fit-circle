export function getLatestQueuedWeight(session, exerciseId) {
  const queue = session?.weightQueues?.[exerciseId];
  if (!queue?.length) return null;
  return queue[queue.length - 1];
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
