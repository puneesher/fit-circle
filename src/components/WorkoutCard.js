"use client";

import ExerciseImage from "@/components/ExerciseImage";
import { formatWeight, typeBadgeClass } from "@/lib/format-weight";

function WorkoutDetails({ item, done, isNext }) {
  return (
    <>
      <div className="flex items-start gap-2">
        <h3
          className={`min-w-0 flex-1 font-medium ${
            done
              ? "text-zinc-500 line-through dark:text-zinc-400"
              : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          {item.Exercise?.Name ?? item.exerciseId}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass(item.Type)}`}
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
    </>
  );
}

function rowClassName({ done, isNext }) {
  if (done) {
    return "bg-emerald-50/80 opacity-70 dark:bg-emerald-950/20";
  }
  if (isNext) {
    return "bg-orange-50/80 dark:bg-orange-950/20";
  }
  return "";
}

export default function WorkoutCard({
  item,
  done = false,
  isNext = false,
  disabled = false,
  onComplete,
  onEditWeight,
}) {
  const thumbnail = item.Exercise?.Picture ? (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
      <ExerciseImage
        src={item.Exercise.Picture}
        alt={item.Exercise.Name}
        fill
        className="object-cover"
        sizes="56px"
      />
    </div>
  ) : null;

  // Click anywhere on the card opens the editor dialog
  function handleClick() {
    if (disabled || done) return;
    if (onEditWeight) {
      onEditWeight(item);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors ${rowClassName({ done, isNext })} ${
        !done && !disabled
          ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          : "cursor-default"
      }`}
    >
      {thumbnail}
      <div className="min-w-0 flex-1">
        <WorkoutDetails item={item} done={done} isNext={isNext} />
      </div>
    </button>
  );
}
