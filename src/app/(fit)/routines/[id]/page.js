import WorkoutCard from "@/components/WorkoutCard";
import { getNextRoutine, getRoutineWithExercises } from "@/lib/routines";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const routine = await getRoutineWithExercises(id);

  return {
    title: routine ? `${routine.Name} | Fitness Circle` : "Routine | Fitness Circle",
  };
}

export default async function RoutinePage({ params }) {
  const { id } = await params;
  const [routine, nextRoutine] = await Promise.all([
    getRoutineWithExercises(id),
    getNextRoutine(id),
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
              href={`/routines/${nextRoutine._id}`}
              className="shrink-0 text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
            >
              Next →
            </Link>
          )}
        </div>

        <ol className="mt-6 space-y-4">
          {routine.Items.map((item, index) => (
            <li
              key={`${item.exerciseId}-${index}`}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <WorkoutCard item={item} />
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
