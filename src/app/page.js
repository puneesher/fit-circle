import WorkoutHome from "@/components/WorkoutHome";
import { getWorkoutHomeData } from "@/lib/workout";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { routines, activeSession, activeRoutine } = await getWorkoutHomeData();

  return (
    <WorkoutHome
      initialRoutines={routines}
      initialSession={activeSession}
      initialRoutine={activeRoutine}
    />
  );
}
