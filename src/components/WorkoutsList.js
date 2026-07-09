import WorkoutCard from "@/components/WorkoutCard";
import { withEffectiveWeight } from "@/lib/exercise-weight";

export default function WorkoutsList({
  routine,
  session,
  completedIds,
  loading,
  onCompleteItem,
  onEditWeight,
  onEndWorkout,
  onCancelWorkout,
  onDeleteWorkout,
}) {
  const progress = `${completedIds.size}/${routine.Items.length}`;
  const hasActiveSession = session.status === "active";

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
              {routine.Name}
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Tap an exercise when done. Tap its image to adjust weight.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            {progress}
          </span>
        </div>

        {session.status === "completed" && (
          <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Workout complete
          </p>
        )}

        {hasActiveSession && (
          <div className="mt-3 space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={onEndWorkout}
              className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              End workout
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={onCancelWorkout}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onDeleteWorkout}
                className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <ol className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {routine.Items.map((item, index) => {
          const done = completedIds.has(item.exerciseId);
          const isNext =
            !done &&
            routine.Items.findIndex(
              (entry) => !completedIds.has(entry.exerciseId),
            ) === index;

          return (
            <li key={`${item.exerciseId}-${index}`}>
              <WorkoutCard
                item={withEffectiveWeight(item, session)}
                done={done}
                isNext={isNext}
                disabled={loading || session.status === "completed"}
                onEditWeight={
                  hasActiveSession ? onEditWeight : undefined
                }
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
