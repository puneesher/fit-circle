"use client";

import { useEffect, useState } from "react";
import ImagePicker from "@/components/ImagePicker";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500";

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ExerciseEditDialog({ exercise, open, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [muscles, setMuscles] = useState("");
  const [picture, setPicture] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Sync fields when exercise changes or dialog opens
  useEffect(() => {
    if (open && exercise) {
      setName(exercise.Name ?? "");
      setTarget(exercise.Target ?? "");
      setMuscles((exercise.Muscles ?? []).join(", "));
      setPicture(exercise.Picture ?? "");
      setError(null);
    }
  }, [open, exercise]);

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    const updates = {
      Name: trimmedName,
      Target: target.trim() || undefined,
      Muscles: muscles
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      Picture: picture || undefined,
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/exercises/${exercise._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to save exercise.");

      const saved = await res.json();
      onSaved(saved);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!open || !exercise) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-labelledby="exercise-edit-title"
        aria-modal="true"
        className="flex max-h-[90dvh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2
            id="exercise-edit-title"
            className="font-medium text-zinc-900 dark:text-zinc-50"
          >
            Edit exercise
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
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <Field label="Name *" htmlFor="edit-name">
              <input
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Target muscle" htmlFor="edit-target">
              <input
                id="edit-target"
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. Chest"
                className={inputClass}
              />
            </Field>

            <Field label="Muscles (comma-separated)" htmlFor="edit-muscles">
              <input
                id="edit-muscles"
                type="text"
                value={muscles}
                onChange={(e) => setMuscles(e.target.value)}
                placeholder="e.g. pectoralis major, triceps"
                className={inputClass}
              />
            </Field>

            <Field label="Image" htmlFor="edit-picture">
              <ImagePicker value={picture} onChange={setPicture} />
            </Field>

            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
