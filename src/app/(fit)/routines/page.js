import { getRoutineStorage } from "@/lib/storage";
import SortableRoutineList from "@/components/SortableRoutineList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Routines | Fitness Circle",
};

export default async function RoutinesPage() {
  const routines = await getRoutineStorage().readAll();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Routines
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Your workout templates</p>

        {routines.length === 0 ? (
          <p className="mt-6 text-zinc-500">No routines yet.</p>
        ) : (
          <SortableRoutineList initialRoutines={routines} />
        )}
      </main>
    </div>
  );
}
