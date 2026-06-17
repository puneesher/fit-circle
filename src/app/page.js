import PageClient from "@/app/page-client";
import { getWorkoutHomeData } from "@/lib/workout";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { routines, activeSession, activeRoutine } = await getWorkoutHomeData();

  return (
    <PageClient
      initialRoutines={routines}
      initialSession={activeSession}
      initialRoutine={activeRoutine}
    />
  );
}
