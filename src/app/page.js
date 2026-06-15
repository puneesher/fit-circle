import WorkoutHome from "@/components/WorkoutHome";
import { getBaseUrl } from "@/lib/api";

async function getHomeData() {
  const res = await fetch(`${getBaseUrl()}/api/history`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch workout data");
  return res.json();
}

async function getRoutines() {
  const res = await fetch(`${getBaseUrl()}/api/routines`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch routines");
  return res.json();
}

export default async function Home() {
  const [routines, homeData] = await Promise.all([getRoutines(), getHomeData()]);

  return (
    <WorkoutHome
      initialRoutines={routines}
      initialSession={homeData.activeSession}
      initialRoutine={homeData.activeRoutine}
    />
  );
}
