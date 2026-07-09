import { getMuscleStorage, getMuscleGroupStorage } from "@/lib/storage";
import MusclesClient from "./muscles-client";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Muscles | Fitness Circle",
};

export default async function MusclesPage() {
  const [muscles, muscleGroups] = await Promise.all([
    getMuscleStorage().readAll(),
    getMuscleGroupStorage().readAll(),
  ]);

  return (
    <>
      <AppHeader />
      <MusclesClient muscles={muscles} muscleGroups={muscleGroups} />
    </>
  );
}
