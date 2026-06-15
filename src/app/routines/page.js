import { getRoutineStorage } from "@/lib/storage";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Routines | Fit Circle",
};

export default async function RoutinesPage() {
  const routines = await getRoutineStorage().readAll();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Routines
          </h1>
          <Link
            href="/exercises"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Exercises
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {routines.length === 0 ? (
          <p className="text-zinc-500">No routines yet.</p>
        ) : (
          <ul className="space-y-3">
            {routines.map((routine) => (
              <li key={routine._id}>
                <Link
                  href={`/routines/${routine._id}`}
                  className="block rounded-xl border border-zinc-200 bg-white px-5 py-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    {routine.Name}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {routine.Items.length} exercises
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
