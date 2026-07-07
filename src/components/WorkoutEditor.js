"use client";

import { formatWeight } from "@/lib/format-weight";
import ExerciseImage from "@/components/ExerciseImage";
import { useEffect, useState } from "react";

export default function WorkoutEditor({
  item,
  open,
  loading = false,
  onCancel,
  onConfirm,
}) {
  const [weight, setWeight] = useState(item?.Weight ?? 0);
  const [sets, setSets] = useState(item?.Sets ?? 4);
  const [reps, setReps] = useState(item?.Reps ?? 12);

  useEffect(() => {
    if (open && item) {
      setWeight(item.Weight ?? 0);
      setSets(item.Sets ?? 4);
      setReps(item.Reps ?? 12);
    }
  }, [open, item]);

  if (!open || !item) return null;

  function adjustWeight(delta) {
    setWeight((current) => Math.max(0, current + delta));
  }

  function adjustSets(delta) {
    setSets((current) => Math.max(1, current + delta));
  }

  function adjustReps(delta) {
    setReps((current) => Math.max(1, current + delta));
  }

  const picture = item.Exercise?.Picture;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-labelledby="workout-editor-title"
        aria-modal="true"
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Exercise Image */}
        {picture && (
          <div className="relative h-48 w-full bg-zinc-100 dark:bg-zinc-800">
            <ExerciseImage
              src={picture}
              alt={item.Exercise?.Name ?? "Exercise"}
              fill
              className="object-contain"
              sizes="(max-width: 384px) 100vw, 384px"
            />
          </div>
        )}

        {/* Title */}
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2
            id="workout-editor-title"
            className="font-medium text-zinc-900 dark:text-zinc-50"
          >
            {item.Exercise?.Name ?? item.exerciseId}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Adjust sets, reps, and weight
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4 px-4 py-5">
          {/* Sets */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Sets</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => adjustSets(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                −
              </button>
              <span className="min-w-[2.5rem] text-center text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {sets}
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={() => adjustSets(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>
          </div>

          {/* Reps */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Reps</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => adjustReps(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                −
              </button>
              <span className="min-w-[2.5rem] text-center text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {reps}
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={() => adjustReps(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>
          </div>

          {/* Weight */}
          {item.Weight != null && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Weight</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => adjustWeight(-5)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  −5
                </button>
                <span className="min-w-[5rem] text-center text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {formatWeight({ ...item, Weight: weight })}
                </span>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => adjustWeight(5)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  +5
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirm({ weight, sets, reps })}
            className="flex-1 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
