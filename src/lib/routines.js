import { getExerciseStorage, getRoutineStorage } from "@/lib/storage";

export async function getRoutineWithExercises(id, userId) {
  const routineStorage = getRoutineStorage();
  const exerciseStorage = getExerciseStorage();

  const [routines, exercises] = await Promise.all([
    userId ? routineStorage.readByUser(userId) : routineStorage.readAll(),
    exerciseStorage.readAll(),
  ]);

  const routine = routines.find((entry) => entry._id === id);
  if (!routine) return null;

  const exerciseById = Object.fromEntries(
    exercises.map((exercise) => [exercise._id, exercise]),
  );

  return {
    ...routine,
    Items: routine.Items.map((item) => ({
      ...item,
      Exercise: exerciseById[item.exerciseId] ?? null,
    })),
  };
}

export async function getNextRoutine(currentId, userId) {
  const routineStorage = getRoutineStorage();
  const routines = userId
    ? await routineStorage.readByUser(userId)
    : await routineStorage.readAll();
  const index = routines.findIndex((entry) => entry._id === currentId);

  if (index === -1 || routines.length < 2) return null;

  return routines[(index + 1) % routines.length];
}
