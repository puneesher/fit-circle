import ExercisesClient from "./page-client";
import { getExerciseStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Exercises | Fitness Circle",
};

export default async function ExercisesPage() {
  const exercises = await getExerciseStorage().readAll();
  return <ExercisesClient initialExercises={exercises} />;
}
