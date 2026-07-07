import { getRoutineStorage } from "@/lib/storage";
import SortableRoutineList from "@/components/SortableRoutineList";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Routines | Fitness Circle",
};

export default async function RoutinesPage({ params }) {
  const { username } = await params;
  const routines = await getRoutineStorage().readByUser(username);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Routines
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Your workout templates</p>
          </div>
          <Link
            href={`/${username}/routines/new`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            aria-label="Create new routine"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="10" y1="4" x2="10" y2="16" />
              <line x1="4" y1="10" x2="16" y2="10" />
            </svg>
          </Link>
        </div>

        {routines.length === 0 ? (
          <p className="mt-6 text-zinc-500">No routines yet.</p>
        ) : (
          <SortableRoutineList initialRoutines={routines} username={username} />
        )}
      </main>
    </div>
  );
}
