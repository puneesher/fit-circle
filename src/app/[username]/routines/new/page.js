import { getExerciseStorage } from "@/lib/storage";
import CreateRoutineClient from "./create-routine-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Routine | Fitness Circle",
};

export default async function NewRoutinePage({ params }) {
  const { username } = await params;
  const exercises = await getExerciseStorage().readAll();

  return <CreateRoutineClient username={username} exercises={exercises} />;
}
