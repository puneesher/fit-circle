"use client";

import ExerciseImage from "@/components/ExerciseImage";
import { formatWeight, typeBadgeClass } from "@/lib/format-weight";
import { useState } from "react";

export default function WorkoutHome({
  initialRoutines,
  initialSession,
  initialRoutine,
}) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [selectedRoutineId, setSelectedRoutineId] = useState(
    initialSession?.routineId ?? initialRoutines[0]?._id ?? null,
  );
  const [session, setSession] = useState(initialSession);
  const [routine, setRoutine] = useState(initialRoutine);
  const [routinePanelOpen, setRoutinePanelOpen] = useState(!initialSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const completedIds = new Set(
    session?.completedItems?.map((item) => item.exerciseId) ?? [],
  );

  async function startDay() {
    if (!selectedRoutineId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routineId: selectedRoutineId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to start workout");
      }

      const data = await res.json();
      setSession(data.session);
      setRoutine(data.routine);
      setRoutinePanelOpen(false);

      const routinesRes = await fetch("/api/routines");
      if (routinesRes.ok) {
        setRoutines(await routinesRes.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function completeItem(exerciseId) {
    if (!session || completedIds.has(exerciseId)) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/history/${session._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to complete exercise");
      }

      const data = await res.json();
      setSession(data.session);
      setRoutine(data.routine);
      setRoutines(data.routines);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function finishWorkout(action) {
    if (!session || session.status !== "active") return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/history/${session._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update workout");
      }

      const data = await res.json();
      setRoutines(data.routines);
      setSession(null);
      setRoutine(null);
      setRoutinePanelOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const hasActiveSession = session?.status === "active";
  const selectedRoutine = routines.find((entry) => entry._id === selectedRoutineId);
  const progress = routine
    ? `${completedIds.size}/${routine.Items.length}`
    : null;

  const exerciseSection = session && routine && (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
              {routine.Name}
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              Tap an exercise when done. It moves to the bottom.
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
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => finishWorkout("end")}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              End workout
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => finishWorkout("cancel")}
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <ol className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {routine.Items.map((item, index) => {
          const done = completedIds.has(item.exerciseId);
          const isNext = !done && routine.Items.findIndex(
            (entry) => !completedIds.has(entry.exerciseId),
          ) === index;

          return (
            <li key={`${item.exerciseId}-${index}`}>
              <button
                type="button"
                disabled={loading || done || session.status === "completed"}
                onClick={() => completeItem(item.exerciseId)}
                className={`flex w-full gap-3 px-4 py-3 text-left transition-colors ${
                  done
                    ? "bg-emerald-50/80 opacity-70 dark:bg-emerald-950/20"
                    : isNext
                      ? "bg-orange-50/80 hover:bg-orange-100/80 dark:bg-orange-950/20 dark:hover:bg-orange-950/40"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                } disabled:cursor-default`}
              >
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
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {formatWeight(item)}
                    </p>
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
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-4">
        <p className="text-sm text-zinc-500">Today&apos;s workout</p>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}

        {!routinePanelOpen && exerciseSection}

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setRoutinePanelOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 text-left dark:border-zinc-800"
          >
            <div className="min-w-0">
              <h2 className="font-medium text-zinc-900 dark:text-zinc-50">
                {routinePanelOpen ? "Choose routine" : (selectedRoutine?.Name ?? "Routine")}
              </h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                {routinePanelOpen
                  ? "Top routine is up next. Starting one moves it to the bottom."
                  : hasActiveSession
                    ? "Workout in progress · tap to change routine"
                    : "Tap to choose a different routine"}
              </p>
            </div>
            <span
              className={`shrink-0 text-zinc-400 transition-transform ${routinePanelOpen ? "rotate-180" : ""}`}
              aria-hidden
            >
              ▼
            </span>
          </button>

          {routinePanelOpen && (
            <>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {routines.map((entry, index) => {
              const isSelected = entry._id === selectedRoutineId;
              const isActive = session?.routineId === entry._id && session?.status === "active";

              return (
                <li key={entry._id}>
                  <button
                    type="button"
                    disabled={loading || isActive}
                    onClick={() => {
                      setSelectedRoutineId(entry._id);
                      if (isActive) setRoutinePanelOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    } ${isActive ? "opacity-60" : ""}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {entry.Name}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {entry.Items.length} exercises
                        {isActive ? " · in progress" : ""}
                      </p>
                    </div>
                    {isSelected && !isActive && (
                      <span className="shrink-0 rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                        Selected
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <button
              type="button"
              disabled={loading || !selectedRoutineId || hasActiveSession}
              onClick={startDay}
              className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {loading ? "Starting…" : "Start today"}
            </button>
          </div>
            </>
          )}
        </section>

        {routinePanelOpen && exerciseSection}
      </main>
    </div>
  );
}
