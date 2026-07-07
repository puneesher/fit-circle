import PageClient from "./page-client";
import { getWorkoutHomeData } from "@/lib/workout";

export const dynamic = "force-dynamic";

export default async function SessionsPage({ params }) {
  const { username } = await params;
  const { routines, activeSession, activeRoutine } = await getWorkoutHomeData(username);

  return (
    <PageClient
      username={username}
      initialRoutines={routines}
      initialSession={activeSession}
      initialRoutine={activeRoutine}
    />
  );
}
