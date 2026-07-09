import { getExerciseStorage, getMuscleGroupStorage } from "@/lib/storage";
import CreateRoutineClient from "./create-routine-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Routine | Fitness Circle",
};

export default async function NewRoutinePage({ params }) {
  const { username } = await params;
  const [exercises, muscleGroups] = await Promise.all([
    getExerciseStorage().readAll(),
    getMuscleGroupStorage().readAll(),
  ]);

  return <CreateRoutineClient username={username} exercises={exercises} muscleGroups={muscleGroups} />;
}
