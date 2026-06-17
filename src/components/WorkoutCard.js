import ExerciseImage from "@/components/ExerciseImage";
import { formatWeight, typeBadgeClass } from "@/lib/format-weight";

export default function WorkoutCard({
  item,
  done = false,
  isNext = false,
  disabled = false,
  onComplete,
}) {
  const content = (
    <>
      {item.Exercise?.Picture && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <ExerciseImage
            src={item.Exercise.Picture}
            alt={item.Exercise.Name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3
            className={`font-medium ${
              done
                ? "text-zinc-500 line-through dark:text-zinc-400"
                : "text-zinc-900 dark:text-zinc-50"
            }`}
          >
            {item.Exercise?.Name ?? item.exerciseId}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass(item.Type)}`}
          >
            {item.Type}
          </span>
        </div>

        {formatWeight(item) && (
          <p className="mt-1.5 text-base font-bold text-zinc-900 dark:text-zinc-50">
            {formatWeight(item)}
          </p>
        )}

        {item.Note && (
          <p className="mt-1 text-sm text-zinc-500">{item.Note}</p>
        )}

        {item.Sets != null && item.Reps != null && (
          <p className="mt-0.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {item.Sets}×{item.Reps}
          </p>
        )}

        {isNext && (
          <p className="mt-1 text-xs font-medium text-orange-700 dark:text-orange-300">
            Up next
          </p>
        )}
      </div>
    </>
  );

  if (!onComplete) {
    return (
      <div className="flex gap-3 px-4 py-3">{content}</div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onComplete(item.exerciseId)}
      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors ${
        done
          ? "bg-emerald-50/80 opacity-70 dark:bg-emerald-950/20"
          : isNext
            ? "bg-orange-50/80 hover:bg-orange-100/80 dark:bg-orange-950/20 dark:hover:bg-orange-950/40"
            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      } disabled:cursor-default`}
    >
      {content}
    </button>
  );
}
