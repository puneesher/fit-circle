import ExerciseImage from "@/components/ExerciseImage";
import { getExerciseStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Exercises | Fitness Circle",
};

export default async function ExercisesPage() {
  const exercises = await getExerciseStorage().readAll();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Exercises
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Exercise library</p>

        {exercises.length === 0 ? (
          <p className="mt-6 text-zinc-500">No exercises yet.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
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
