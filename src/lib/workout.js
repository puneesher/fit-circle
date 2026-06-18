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

export async function getActiveSessions() {
  const history = await getHistoryStorage().readAll();
  return history.filter((entry) => entry.status === "active");
}

export async function getActiveSession() {
  const actives = await getActiveSessions();
  if (actives.length === 0) return null;

  return actives.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )[0];
}

export async function getWorkoutHomeData() {
  const [routines, activeSessions] = await Promise.all([
    getRoutineStorage().readAll(),
    getActiveSessions(),
  ]);

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

export async function startWorkoutDay(routineId) {
  const routine = await getRoutineWithExercises(routineId);
  if (!routine) return null;

  const storage = getHistoryStorage();
  const history = await storage.readAll();
  const now = new Date().toISOString();
  const date = todayDate();

  for (const entry of history) {
    if (entry.status === "active") {
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

export async function completeExercise(sessionId, exerciseId) {
  const historyStorage = getHistoryStorage();
  const history = await historyStorage.readAll();
  const session = history.find((entry) => entry._id === sessionId);

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

export async function setExerciseWeight(sessionId, exerciseId, weight) {
  const historyStorage = getHistoryStorage();
  const history = await historyStorage.readAll();
  const session = history.find((entry) => entry._id === sessionId);

  if (!session || session.status !== "active") return null;

  const routine = await getRoutineWithExercises(session.routineId);
  const item = routine?.Items.find((entry) => entry.exerciseId === exerciseId);

  if (!item || item.Weight == null) return null;

  if (!session.weightQueues) {
    session.weightQueues = {};
  }

  if (!session.weightQueues[exerciseId]) {
    session.weightQueues[exerciseId] = [];
  }

  session.weightQueues[exerciseId].push(weight);
  await historyStorage.writeAll(history);

  return { session };
}

export async function endWorkout(sessionId) {
  const historyStorage = getHistoryStorage();
  const history = await historyStorage.readAll();
  const session = history.find((entry) => entry._id === sessionId);

  if (!session || session.status !== "active") return null;

  session.status = "completed";
  session.completedAt = new Date().toISOString();
  await historyStorage.writeAll(history);

  return session;
}

export async function cancelWorkout(sessionId) {
  const historyStorage = getHistoryStorage();
  const history = await historyStorage.readAll();
  const session = history.find((entry) => entry._id === sessionId);

  if (!session || session.status !== "active") return null;

  session.status = "cancelled";
  session.cancelledAt = new Date().toISOString();
  await historyStorage.writeAll(history);

  return session;
}

export async function deleteWorkout(sessionId) {
  const historyStorage = getHistoryStorage();
  const history = await historyStorage.readAll();
  const index = history.findIndex((entry) => entry._id === sessionId);

  if (index === -1) return null;

  const session = history[index];
  if (session.status !== "active") return null;

  history.splice(index, 1);
  await historyStorage.writeAll(history);

  return session;
}

export async function getWorkoutHistory() {
  const history = await getHistoryStorage().readAll();
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
