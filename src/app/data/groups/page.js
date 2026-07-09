import { getMuscleGroupStorage } from "@/lib/storage";
import MuscleGroupsClient from "./muscle-groups-client";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Muscle Groups | Fitness Circle",
};

export default async function MuscleGroupsPage() {
  const groups = await getMuscleGroupStorage().readAll();
  return (
    <>
      <AppHeader />
      <MuscleGroupsClient groups={groups} />
    </>
  );
}
