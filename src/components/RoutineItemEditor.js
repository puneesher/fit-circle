"use client";

import { useEffect, useState } from "react";

const TYPES = ["Push", "Pull", "Legs", "Core", "Cardio"];
const UNITS = ["lb", "kg", "kg/side", "lb/side"];

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500";

function Stepper({ label, value, onChange, step = 1, min = 0 }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-zinc-500">{label}</p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, (Number(value) || 0) - step))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          −
        </button>
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-center text-lg font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <button
          type="button"
          onClick={() => onChange((Number(value) || 0) + step)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          +
        </button>
      </div>
    </div>
  );
}

/**
 * Edit the numeric/meta fields of a routine item or a history completed item.
 * Matches the visual style of WorkoutEditor.
 *
 * Props (routine mode):
 *   routineId — ID of the routine
 *   itemIndex — positional index in routine.Items
 *
 * Props (history mode):
 *   sessionId — ID of the history session
 *   itemIndex — positional index in completedItems
 *
 * Common props:
 *   item      — the item (with Exercise populated)
 *   open      — boolean
 *   onCancel  — called on dismiss
 *   onSaved   — called with the updated item on success
 */
export default function RoutineItemEditor({
  item,
  itemIndex,
  routineId,
  sessionId,
  open,
  onCancel,
  onSaved,
}) {
  const [type, setType] = useState("Push");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("lb");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && item) {
      setType(item.Type ?? "Push");
      setSets(item.Sets ?? "");
      setReps(item.Reps ?? "");
      setWeight(item.Weight ?? "");
      setUnit(item.Unit ?? "lb");
      setNote(item.Note ?? "");
      setError(null);
    }
  }, [open, item]);

  if (!open || !item) return null;

  async function handleConfirm() {
    setSaving(true);
    setError(null);
    try {
      let res;

      if (sessionId) {
        // History mode — PATCH /api/history/[sessionId] with action: editItem
        res = await fetch(`/api/history/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "editItem",
            itemIndex,
            updates: { type, sets, reps, weight, unit, note },
          }),
        });
      } else {
        // Routine mode — PATCH /api/routines/[routineId]/items/[index]
        res = await fetch(`/api/routines/${routineId}/items/${itemIndex}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, sets, reps, weight, unit, note }),
        });
      }

      if (!res.ok) throw new Error("Failed to save.");

      const data = await res.json();
      const updated = sessionId ? data.updatedItem : data;
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-labelledby="routine-item-editor-title"
        aria-modal="true"
        className="flex max-h-[90dvh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2
            id="routine-item-editor-title"
            className="font-medium text-zinc-900 dark:text-zinc-50"
          >
            {item.Exercise?.Name ?? item.exerciseId}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">Edit exercise details</p>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">

          {/* Type */}
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500">Type</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    type === t
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "border border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Sets + Reps steppers */}
          <div className="grid grid-cols-2 gap-4">
            <Stepper label="Sets" value={sets} onChange={setSets} min={1} />
            <Stepper label="Reps" value={reps} onChange={setReps} min={1} />
          </div>

          {/* Weight + Unit */}
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500">Weight</p>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setWeight((w) => String(Math.max(0, (Number(w) || 0) - 5)))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  −5
                </button>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-16 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-center text-lg font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                />
                <button
                  type="button"
                  onClick={() => setWeight((w) => String((Number(w) || 0) + 5))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  +5
                </button>
              </div>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="item-note" className="mb-1 block text-xs font-medium text-zinc-500">
              Note
            </label>
            <input
              id="item-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              className={inputClass}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleConfirm}
            className="flex-1 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
