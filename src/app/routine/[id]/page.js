import { getBaseUrl } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getRoutine(id) {
  const res = await fetch(`${getBaseUrl()}/api/routines/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch routine");
  return res.json();
}

function formatReps(reps) {
  return reps.join("/");
}

function formatWeights(weights) {
  return weights.join(" / ");
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const routine = await getRoutine(id);

  return {
    title: routine ? `${routine.Name} | Fit Circle` : "Routine | Fit Circle",
  };
}

export default async function RoutinePage({ params }) {
  const { id } = await params;
  const routine = await getRoutine(id);

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
          <Link
            href="/exercises"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Exercises
          </Link>
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
                    <Image
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
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.Type === "Push"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
                          : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
                      }`}
                    >
                      {item.Type}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    {formatWeights(item.Weights)}
                  </p>

                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.Sets}×{formatReps(item.Reps)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
