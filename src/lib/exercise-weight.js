export function getLatestQueuedWeight(session, exerciseId) {
  const queue = session?.weightQueues?.[exerciseId];
  if (!queue?.length) return null;
  return queue[queue.length - 1];
}

export function withEffectiveWeight(item, session) {
  const latest = getLatestQueuedWeight(session, item.exerciseId);
  if (latest == null || item.Weight == null) return item;

  return { ...item, Weight: latest };
}
