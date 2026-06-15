import ExerciseImage from "@/components/ExerciseImage";
import { getBaseUrl } from "@/lib/api";
import Link from "next/link";

async function getExercises() {
  const res = await fetch(`${getBaseUrl()}/api/exercises`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch exercises");
  return res.json();
}

export const metadata = {
  title: "Exercises | Fit Circle",
};

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Exercises
          </h1>
          <Link
            href="/routines"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Routines
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {exercises.length === 0 ? (
          <p className="text-zinc-500">No exercises yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {exercises.map((exercise) => (
              <li
                key={exercise._id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800">
                  <ExerciseImage
                    src={exercise.Picture}
                    alt={exercise.Name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    {exercise.Name}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Target: {exercise.Target}
                  </p>
                  {exercise.Muscles?.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {exercise.Muscles.map((muscle) => (
                        <li
                          key={muscle}
                          className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {muscle}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
