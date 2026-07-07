"use client";

import { useState } from "react";
import ExerciseImage from "@/components/ExerciseImage";
import ExerciseEditDialog from "@/components/ExerciseEditDialog";

function PencilIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61a.75.75 0 0 1-.37.199l-3.25.65a.75.75 0 0 1-.877-.877l.65-3.25a.75.75 0 0 1 .199-.37l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L3.5 11.06l-.39 1.95 1.95-.39 8.573-8.573a.25.25 0 0 0 0-.354l-1.086-1.086-.12-.12Z" />
    </svg>
  );
}

export default function ExercisesClient({ initialExercises }) {
  const [exercises, setExercises] = useState(initialExercises);
  const [editing, setEditing] = useState(null); // exercise being edited

  function handleSaved(updated) {
    setExercises((prev) =>
      prev.map((ex) => (ex._id === updated._id ? updated : ex)),
    );
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Exercises
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Exercise library</p>

        {exercises.length === 0 ? (
          <p className="mt-6 text-zinc-500">No exercises yet.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {exercises.map((exercise) => (
              <li
                key={exercise._id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Image with edit button overlay */}
                <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800">
                  {exercise.Picture ? (
                    <ExerciseImage
                      src={exercise.Picture}
                      alt={exercise.Name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-600">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2Zm0 12c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4Z" />
                      </svg>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(exercise)}
                    aria-label={`Edit ${exercise.Name}`}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-sm transition-colors hover:bg-white hover:text-zinc-900 dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  >
                    <PencilIcon />
                  </button>
                </div>

                <div className="p-4">
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    {exercise.Name}
                  </h2>
                  {exercise.Target && (
                    <p className="mt-1 text-sm text-zinc-500">
                      Target: {exercise.Target}
                    </p>
                  )}
                  {exercise.Muscles?.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {exercise.Muscles.map((muscle) => (
                        <li
                          key={muscle}
                          className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {muscle}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <ExerciseEditDialog
        exercise={editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
