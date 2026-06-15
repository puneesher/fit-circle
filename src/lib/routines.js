import { getExerciseStorage, getRoutineStorage } from "@/lib/storage";

export async function getRoutineWithExercises(id) {
  const routineStorage = getRoutineStorage();
  const exerciseStorage = getExerciseStorage();

  const [routines, exercises] = await Promise.all([
    routineStorage.readAll(),
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
