import DailyVolumeChart from "@/components/DailyVolumeChart";
import {
  formatSessionDate,
  formatSessionTime,
  sessionStatusClass,
  sessionStatusLabel,
} from "@/lib/history-display";
import { getWorkoutHistory } from "@/lib/workout";
import { getMuscleGroupStorage, getRoutineStorage } from "@/lib/storage";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "History | Fitness Circle",
};

export default async function HistoryPage({ params }) {
  const { username } = await params;
  const [history, routines, muscleGroups] = await Promise.all([
    getWorkoutHistory(username),
    getRoutineStorage().readByUser(username),
    getMuscleGroupStorage().readAll(),
  ]);

  // Build a map: routineId → colors array
  const groupColorMap = Object.fromEntries(
    muscleGroups.map((g) => [g._id, g.color])
  );
  const routineColors = Object.fromEntries(
    routines.map((r) => [
      r._id,
      (r.muscleGroups ?? []).map((gId) => groupColorMap[gId]).filter(Boolean),
    ])
  );

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          History
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Your past workouts</p>

        <div className="mt-6">
          <DailyVolumeChart history={history} routineColors={routineColors} />
        </div>

        {history.length === 0 ? (
          <p className="mt-6 text-zinc-500">No workouts yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {history.map((session) => (
              <li key={session._id}>
                <Link
                  href={`/${username}/history/${session._id}`}
                  className="block rounded-xl border border-zinc-200 bg-white px-4 py-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                        {session.routineName}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        {formatSessionDate(session.startedAt)} ·{" "}
                        {formatSessionTime(session.startedAt)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${sessionStatusClass(session.status)}`}
                    >
                      {sessionStatusLabel(session.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    {session.completedItems.length} exercise
                    {session.completedItems.length === 1 ? "" : "s"} logged
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
