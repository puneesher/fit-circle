import {
  getExerciseStorage,
  getHistoryStorage,
  getRoutineStorage,
} from "@/lib/storage";
import { getLatestQueuedWeight } from "@/lib/exercise-weight";
import { getRoutineWithExercises } from "@/lib/routines";

function sessionId(date, routineId) {
  return `${date}-${routineId}-${Date.now()}`;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function getActiveSessions(userId) {
  const history = userId
    ? await getHistoryStorage().readByUser(userId)
    : await getHistoryStorage().readAll();
  return history.filter((entry) => entry.status === "active");
}

export async function getActiveSession(userId) {
  const actives = await getActiveSessions(userId);
  if (actives.length === 0) return null;

  return actives.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )[0];
}

export async function getWorkoutHomeData(userId) {
  const [routines, userHistory] = await Promise.all([
    userId ? getRoutineStorage().readByUser(userId) : getRoutineStorage().readAll(),
    userId ? getHistoryStorage().readByUser(userId) : getHistoryStorage().readAll(),
  ]);

  const activeSessions = userHistory.filter((entry) => entry.status === "active");

  const activeSession = activeSessions.length
    ? activeSessions.sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      )[0]
    : null;

  let activeRoutine = null;
  if (activeSession) {
    activeRoutine = await getRoutineWithExercises(activeSession.routineId);
  }

  return {
    routines,
    activeSessions,
    activeSession,
    activeRoutine,
  };
}

export async function rotateRoutineToEnd(routineId) {
  const storage = getRoutineStorage();
  // Must use readAll() for writes to avoid overwriting other users' data
  const routines = await storage.readAll();
  const index = routines.findIndex((entry) => entry._id === routineId);

  if (index === -1) return routines;

  const [routine] = routines.splice(index, 1);
  routines.push(routine);
  await storage.writeAll(routines);
  return routines;
}

export async function rotateItemToEnd(routineId, exerciseId) {
  const storage = getRoutineStorage();
  // Must use readAll() for writes to avoid overwriting other users' data
  const routines = await storage.readAll();
  const routine = routines.find((entry) => entry._id === routineId);

  if (!routine) return null;

  const index = routine.Items.findIndex((item) => item.exerciseId === exerciseId);
  if (index === -1) return routine;

  const [item] = routine.Items.splice(index, 1);
  routine.Items.push(item);
  await storage.writeAll(routines);
  return routine;
}

export async function startWorkoutDay(routineId, userId) {
  const routine = await getRoutineWithExercises(routineId);
  if (!routine) return null;

  const storage = getHistoryStorage();
  // Must use readAll() for writes to avoid overwriting other users' data
  const history = await storage.readAll();
  const now = new Date().toISOString();
  const date = todayDate();

  // Only cancel active sessions belonging to the same user
  for (const entry of history) {
    if (entry.status === "active" && (entry.userId ?? "im") === userId) {
      entry.status = "completed";
      entry.completedAt = now;
    }
  }

  const session = {
    _id: sessionId(date, routineId),
    date,
    startedAt: now,
    routineId,
    routineName: routine.Name,
    status: "active",
    userId,
    completedItems: [],
    weightQueues: {},
  };

  history.push(session);
  await storage.writeAll(history);
  await rotateRoutineToEnd(routineId);

  return {
    session,
    routine,
  };
}

export async function completeExercise(sessionId, exerciseId, userId) {
  const historyStorage = getHistoryStorage();
  // Must use readAll() for writes to avoid overwriting other users' data
  const history = await historyStorage.readAll();
  const session = history.find(
    (entry) => entry._id === sessionId && (userId == null || (entry.userId ?? "im") === userId),
  );

  if (!session || session.status !== "active") return null;

  const routine = await getRoutineWithExercises(session.routineId);
  if (!routine) return null;

  const item = routine.Items.find((entry) => entry.exerciseId === exerciseId);
  if (!item) return null;

  const alreadyDone = session.completedItems.some(
    (entry) => entry.exerciseId === exerciseId,
  );
  if (alreadyDone) return { session, routine };

  const { Exercise, ...itemSnapshot } = item;
  const queuedWeight = getLatestQueuedWeight(session, exerciseId);

  session.completedItems.push({
    ...itemSnapshot,
    ...(queuedWeight != null ? { Weight: queuedWeight } : {}),
    completedAt: new Date().toISOString(),
  });

  const totalItems = routine.Items.length;
  if (session.completedItems.length >= totalItems) {
    session.status = "completed";
    session.completedAt = new Date().toISOString();
  }

  await historyStorage.writeAll(history);
  await rotateItemToEnd(session.routineId, exerciseId);

  const updatedRoutine = await getRoutineWithExercises(session.routineId);

  return {
    session,
    routine: updatedRoutine,
  };
}

export async function setExerciseWeight(sessionId, exerciseId, weight, userId, sets, reps) {
  const historyStorage = getHistoryStorage();
  // Must use readAll() for writes to avoid overwriting other users' data
  const history = await historyStorage.readAll();
  const session = history.find(
    (entry) => entry._id === sessionId && (userId == null || (entry.userId ?? "im") === userId),
  );

  if (!session || session.status !== "active") return null;

  const routine = await getRoutineWithExercises(session.routineId);
  const item = routine?.Items.find((entry) => entry.exerciseId === exerciseId);

  if (!item) return null;

  // Update weight queue if weight provided
  if (weight != null) {
    if (!session.weightQueues) {
      session.weightQueues = {};
    }
    if (!session.weightQueues[exerciseId]) {
      session.weightQueues[exerciseId] = [];
    }
    session.weightQueues[exerciseId].push(weight);
  }

  // Update sets/reps overrides on the session
  if (sets != null || reps != null) {
    if (!session.exerciseOverrides) {
      session.exerciseOverrides = {};
    }
    if (!session.exerciseOverrides[exerciseId]) {
      session.exerciseOverrides[exerciseId] = {};
    }
    if (sets != null) session.exerciseOverrides[exerciseId].Sets = sets;
    if (reps != null) session.exerciseOverrides[exerciseId].Reps = reps;
  }

  await historyStorage.writeAll(history);

  return { session };
}

export async function editCompletedItem(sessionId, itemIndex, updates, userId) {
  const historyStorage = getHistoryStorage();
  // Must use readAll() for writes to avoid overwriting other users' data
  const history = await historyStorage.readAll();
  const session = history.find(
    (entry) => entry._id === sessionId && (userId == null || (entry.userId ?? "im") === userId),
  );

  if (!session) return null;
  if (itemIndex < 0 || itemIndex >= session.completedItems.length) return null;

  const item = { ...session.completedItems[itemIndex] };

  const get = (cap, low) => updates[cap] !== undefined ? updates[cap] : updates[low];
  const type   = get("Type",   "type");
  const sets   = get("Sets",   "sets");
  const reps   = get("Reps",   "reps");
  const weight = get("Weight", "weight");
  const unit   = get("Unit",   "unit");
  const note   = get("Note",   "note");

  if (type   !== undefined) item.Type   = type;
  if (sets   !== undefined) item.Sets   = sets   === "" ? undefined : Number(sets);
  if (reps   !== undefined) item.Reps   = reps   === "" ? undefined : Number(reps);
  if (weight !== undefined) item.Weight = weight === "" || weight == null ? undefined : Number(weight);
  if (unit   !== undefined) item.Unit   = unit   || undefined;
  if (note   !== undefined) item.Note   = String(note).trim() || undefined;

  // Remove undefined keys
  Object.keys(item).forEach((k) => item[k] === undefined && delete item[k]);

  session.completedItems[itemIndex] = item;
  await historyStorage.writeAll(history);

  return { session, updatedItem: item };
}

export async function endWorkout(sessionId, userId) {
  const historyStorage = getHistoryStorage();
  // Must use readAll() for writes to avoid overwriting other users' data
  const history = await historyStorage.readAll();
  const session = history.find(
    (entry) => entry._id === sessionId && (userId == null || (entry.userId ?? "im") === userId),
  );

  if (!session || session.status !== "active") return null;

  session.status = "completed";
  session.completedAt = new Date().toISOString();
  await historyStorage.writeAll(history);

  return session;
}

export async function cancelWorkout(sessionId, userId) {
  const historyStorage = getHistoryStorage();
  // Must use readAll() for writes to avoid overwriting other users' data
  const history = await historyStorage.readAll();
  const session = history.find(
    (entry) => entry._id === sessionId && (userId == null || (entry.userId ?? "im") === userId),
  );

  if (!session || session.status !== "active") return null;

  session.status = "cancelled";
  session.cancelledAt = new Date().toISOString();
  await historyStorage.writeAll(history);

  return session;
}

export async function deleteWorkout(sessionId, userId) {
  const historyStorage = getHistoryStorage();
  // Must use readAll() for writes to avoid overwriting other users' data
  const history = await historyStorage.readAll();
  const index = history.findIndex(
    (entry) => entry._id === sessionId && (userId == null || (entry.userId ?? "im") === userId),
  );

  if (index === -1) return null;

  const session = history[index];
  if (session.status !== "active") return null;

  history.splice(index, 1);
  await historyStorage.writeAll(history);

  return session;
}

export async function getWorkoutHistory(userId) {
  const history = userId
    ? await getHistoryStorage().readByUser(userId)
    : await getHistoryStorage().readAll();
  return history.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

export async function getWorkoutSession(id) {
  const history = await getHistoryStorage().readAll();
  const session = history.find((entry) => entry._id === id);

  if (!session) return null;

  const exercises = await getExerciseStorage().readAll();
  const exerciseById = Object.fromEntries(
    exercises.map((exercise) => [exercise._id, exercise]),
  );

  return {
    ...session,
    completedItems: session.completedItems.map((item) => ({
      ...item,
      Exercise: exerciseById[item.exerciseId] ?? null,
    })),
  };
}
