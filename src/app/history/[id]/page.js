import { formatWeight, typeBadgeClass } from "@/lib/format-weight";
import {
  formatSessionDate,
  formatSessionTime,
  sessionStatusClass,
  sessionStatusLabel,
} from "@/lib/history-display";
import { getWorkoutSession } from "@/lib/workout";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const session = await getWorkoutSession(id);

  return {
    title: session
      ? `${session.routineName} | Fitness Circle`
      : "Workout | Fitness Circle",
  };
}

export default async function HistoryDetailPage({ params }) {
  const { id } = await params;
  const session = await getWorkoutSession(id);

  if (!session) notFound();

  const endedAt = session.completedAt ?? session.cancelledAt;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-4">
        <p className="text-sm text-zinc-500">Workout</p>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {session.routineName}
        </h1>

        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sessionStatusClass(session.status)}`}
            >
              {sessionStatusLabel(session.status)}
            </span>
            <span className="text-sm text-zinc-500">
              {formatSessionDate(session.startedAt)}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Started {formatSessionTime(session.startedAt)}
            {endedAt ? ` · Ended ${formatSessionTime(endedAt)}` : ""}
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {session.completedItems.length} exercise
            {session.completedItems.length === 1 ? "" : "s"} completed
          </p>
        </div>

        {session.completedItems.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">No exercises were logged.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {session.completedItems.map((item, index) => (
              <li
                key={`${item.exerciseId}-${index}`}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                    {item.Exercise?.Name ?? item.exerciseId}
                  </h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass(item.Type)}`}
                  >
                    {item.Type}
                  </span>
                </div>

                {formatWeight(item) && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    {formatWeight(item)}
                  </p>
                )}

                {item.Sets != null && item.Reps != null && (
                  <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.Sets}×{item.Reps}
                  </p>
                )}

                {item.completedAt && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatSessionTime(item.completedAt)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
