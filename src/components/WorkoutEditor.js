"use client";

import { formatWeight } from "@/lib/format-weight";
import { useEffect, useState } from "react";

export default function WorkoutEditor({
  item,
  open,
  loading = false,
  onCancel,
  onConfirm,
}) {
  const [weight, setWeight] = useState(item?.Weight ?? 0);

  useEffect(() => {
    if (open && item?.Weight != null) {
      setWeight(item.Weight);
    }
  }, [open, item]);

  if (!open || !item || item.Weight == null) return null;

  function adjust(delta) {
    setWeight((current) => Math.max(0, current + delta));
  }

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
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2
            id="workout-editor-title"
            className="font-medium text-zinc-900 dark:text-zinc-50"
          >
            {item.Exercise?.Name ?? item.exerciseId}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">Adjust weight for this workout</p>
        </div>

        <div className="px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => adjust(-5)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 text-lg font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              −5
            </button>

            <p className="min-w-[8rem] text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatWeight({ ...item, Weight: weight })}
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={() => adjust(5)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-300 text-lg font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              +5
            </button>
          </div>
        </div>

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
            onClick={() => onConfirm(weight)}
            className="flex-1 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
