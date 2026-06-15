import {
  getHistoryStorage,
  getRoutineStorage,
} from "@/lib/storage";
import { getRoutineWithExercises } from "@/lib/routines";

function sessionId(date, routineId) {
  return `${date}-${routineId}-${Date.now()}`;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function getActiveSession() {
  const history = await getHistoryStorage().readAll();
  return history.find((entry) => entry.status === "active") ?? null;
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

  session.completedItems.push({
    ...itemSnapshot,
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
