"use client";

import { useEffect, useRef, useState } from "react";
import ImagePicker from "@/components/ImagePicker";

const TYPES = ["Push", "Pull", "Legs", "Core", "Cardio"];
const UNITS = ["lb", "kg", "kg/side", "lb/side"];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium text-zinc-500"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500";

export default function AddExerciseDialog({ open, routineId, onClose, onAdded }) {
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [cloneSource, setCloneSource] = useState(null); // exercise being cloned
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Form fields
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newPicture, setNewPicture] = useState("");
  const [type, setType] = useState("Push");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("lb");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const searchRef = useRef(null);

  // Load exercises once when dialog opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/exercises")
      .then((r) => r.json())
      .then(setExercises)
      .catch(() => {});
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  function reset() {
    setQuery("");
    setCreateMode(false);
    setCloneSource(null);
    setSelectedExercise(null);
    setNewName("");
    setNewTarget("");
    setNewPicture("");
    setType("Push");
    setSets("");
    setReps("");
    setWeight("");
    setUnit("lb");
    setNote("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const filtered = exercises.filter((ex) =>
    ex.Name.toLowerCase().includes(query.toLowerCase()),
  );

  function selectExercise(ex) {
    setSelectedExercise(ex);
    setCreateMode(false);
    setError(null);
  }

  function startCreate() {
    setSelectedExercise(null);
    setCloneSource(null);
    setCreateMode(true);
    setNewName(query);
    setError(null);
  }

  function startClone(ex) {
    setSelectedExercise(null);
    setCloneSource(ex);
    setCreateMode(true);
    // Pre-fill name with a copy suffix
    setNewName(`${ex.Name} 2`);
    setNewTarget(ex.Target ?? "");
    setNewPicture(ex.Picture ?? "");
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    let exerciseId;

    try {
      setSaving(true);

      if (createMode) {
        // 1. Create the new exercise
        const name = newName.trim();
        if (!name) {
          setError("Exercise name is required.");
          return;
        }
        const id = slugify(name);
        const newExercise = {
          _id: id,
          Name: name,
          ...(newTarget.trim() && { Target: newTarget.trim() }),
          ...(newPicture && { Picture: newPicture }),
        };
        const exRes = await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newExercise),
        });
        if (!exRes.ok) throw new Error("Failed to save exercise.");
        exerciseId = id;
      } else {
        if (!selectedExercise) {
          setError("Please select an exercise.");
          return;
        }
        exerciseId = selectedExercise._id;
      }

      // 2. Add item to routine
      const item = {
        exerciseId,
        Type: type,
        ...(sets !== "" && { Sets: Number(sets) }),
        ...(reps !== "" && { Reps: Number(reps) }),
        ...(weight !== "" && { Weight: Number(weight), Unit: unit }),
        ...(note.trim() && { Note: note.trim() }),
      };

      const routineRes = await fetch(`/api/routines/${routineId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!routineRes.ok) throw new Error("Failed to add exercise to routine.");

      const exerciseForCard = createMode
        ? { _id: exerciseId, Name: newName.trim(), Target: newTarget.trim() || undefined, Picture: newPicture || undefined }
        : selectedExercise;

      onAdded({ ...item, Exercise: exerciseForCard });
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const showForm = selectedExercise || createMode;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-labelledby="add-exercise-title"
        aria-modal="true"
        className="flex max-h-[90dvh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2
            id="add-exercise-title"
            className="font-medium text-zinc-900 dark:text-zinc-50"
          >
            {showForm
              ? createMode
                ? cloneSource
                  ? `Clone: ${cloneSource.Name}`
                  : "New exercise"
                : (selectedExercise?.Name ?? "Add exercise")
              : "Add exercise"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

            {/* Step 1: search or create */}
            {!showForm && (
              <>
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search exercises…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={inputClass}
                />

                {filtered.length > 0 ? (
                  <ul className="space-y-1">
                    {filtered.map((ex) => (
                      <li key={ex._id} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => selectExercise(ex)}
                          className="min-w-0 flex-1 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <span className="font-medium text-zinc-900 dark:text-zinc-50">
                            {ex.Name}
                          </span>
                          {ex.Target && (
                            <span className="ml-2 text-zinc-400">{ex.Target}</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => startClone(ex)}
                          title={`Clone ${ex.Name}`}
                          className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                        >
                          {/* Copy icon */}
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
                            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500">
                    No exercises match.{" "}
                    <button
                      type="button"
                      onClick={startCreate}
                      className="font-medium text-zinc-900 underline dark:text-zinc-50"
                    >
                      Create "{query || "new exercise"}"
                    </button>
                  </p>
                )}

                {filtered.length > 0 && (
                  <button
                    type="button"
                    onClick={startCreate}
                    className="text-sm font-medium text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-200"
                  >
                    + Create new exercise
                  </button>
                )}
              </>
            )}

            {/* Step 2: form */}
            {showForm && (
              <>
                {/* New exercise name/target (create mode only) */}
                {createMode && (
                  <>
                    <Field label="Exercise name *" htmlFor="new-name">
                      <input
                        id="new-name"
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Cable Fly"
                        className={inputClass}
                        required
                      />
                    </Field>
                    <Field label="Target muscle (optional)" htmlFor="new-target">
                      <input
                        id="new-target"
                        type="text"
                        value={newTarget}
                        onChange={(e) => setNewTarget(e.target.value)}
                        placeholder="e.g. Chest"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Image" htmlFor="new-picture">
                      <ImagePicker value={newPicture} onChange={setNewPicture} />
                    </Field>
                  </>
                )}

                {/* Type */}
                <Field label="Type" htmlFor="ex-type">
                  <select
                    id="ex-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={inputClass}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>

                {/* Sets + Reps */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Sets" htmlFor="ex-sets">
                    <input
                      id="ex-sets"
                      type="number"
                      min="1"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      placeholder="4"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Reps" htmlFor="ex-reps">
                    <input
                      id="ex-reps"
                      type="number"
                      min="1"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder="12"
                      className={inputClass}
                    />
                  </Field>
                </div>

                {/* Weight + Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Weight" htmlFor="ex-weight">
                    <input
                      id="ex-weight"
                      type="number"
                      min="0"
                      step="any"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Unit" htmlFor="ex-unit">
                    <select
                      id="ex-unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className={inputClass}
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Note */}
                <Field label="Note (optional)" htmlFor="ex-note">
                  <input
                    id="ex-note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Manuel Valdivieso"
                    className={inputClass}
                  />
                </Field>
              </>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          {showForm && (
            <div className="flex gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedExercise(null);
                  setCreateMode(false);
                  setCloneSource(null);
                  setError(null);
                }}
                disabled={saving}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {saving ? "Saving…" : "Add to routine"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
