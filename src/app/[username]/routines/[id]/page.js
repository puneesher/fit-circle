import SortableExerciseList from "@/components/SortableExerciseList";
import { getNextRoutine, getRoutineWithExercises } from "@/lib/routines";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { username, id } = await params;
  const routine = await getRoutineWithExercises(id, username);

  return {
    title: routine ? `${routine.Name} | Fitness Circle` : "Routine | Fitness Circle",
  };
}

export default async function RoutinePage({ params }) {
  const { username, id } = await params;
  const [routine, nextRoutine] = await Promise.all([
    getRoutineWithExercises(id, username),
    getNextRoutine(id, username),
  ]);

  if (!routine) notFound();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">Routine</p>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {routine.Name}
            </h1>
          </div>
          {nextRoutine && (
            <Link
              href={`/${username}/routines/${nextRoutine._id}`}
              className="shrink-0 text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
            >
              Next →
            </Link>
          )}
        </div>

        <SortableExerciseList routineId={id} initialItems={routine.Items} />
      </main>
    </div>
  );
}
