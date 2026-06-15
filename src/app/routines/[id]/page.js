import ExerciseImage from "@/components/ExerciseImage";
import { formatWeight, typeBadgeClass } from "@/lib/format-weight";
import { getNextRoutine, getRoutineWithExercises } from "@/lib/routines";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const routine = await getRoutineWithExercises(id);

  return {
    title: routine ? `${routine.Name} | Fit Circle` : "Routine | Fit Circle",
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
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm text-zinc-500">Routine</p>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {routine.Name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {nextRoutine && (
              <Link
                href={`/routines/${nextRoutine._id}`}
                className="text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
              >
                Next →
              </Link>
            )}
            <Link
              href="/routines"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Routines
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <ol className="space-y-4">
          {routine.Items.map((item, index) => (
            <li
              key={`${item.exerciseId}-${index}`}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex gap-4 p-4">
                {item.Exercise?.Picture && (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <ExerciseImage
                      src={item.Exercise.Picture}
                      alt={item.Exercise.Name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                      {item.Exercise?.Name ?? item.exerciseId}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeClass(item.Type)}`}
                    >
                      {item.Type}
                    </span>
                  </div>

                  {formatWeight(item) && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {formatWeight(item)}
                    </p>
                  )}

                  {item.Note && (
                    <p className="mt-1 text-sm text-zinc-500">{item.Note}</p>
                  )}

                  {item.Sets != null && item.Reps != null && (
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {item.Sets}×{item.Reps}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
