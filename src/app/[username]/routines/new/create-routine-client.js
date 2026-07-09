"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRoutineClient({ username, exercises, muscleGroups = [] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function toggleGroup(groupId) {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  }

  const filteredExercises = exercises.filter(
    (ex) =>
      ex.Name.toLowerCase().includes(search.toLowerCase()) ||
      ex.Target?.toLowerCase().includes(search.toLowerCase())
  );

  function addExercise(exercise) {
    setItems((prev) => [
      ...prev,
      {
        exerciseId: exercise._id,
        exerciseName: exercise.Name,
        Type: "Push",
        Weight: null,
        Unit: "lb",
        Sets: 4,
        Reps: 12,
      },
    ]);
    setSearch("");
    setShowPicker(false);
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      setError("Routine name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        userId: username,
        muscleGroups: selectedGroups,
        items: items.map(({ exerciseName, ...item }) => ({
          ...item,
          Weight: item.Weight ? Number(item.Weight) : undefined,
          Sets: item.Sets ? Number(item.Sets) : undefined,
          Reps: item.Reps ? Number(item.Reps) : undefined,
        })),
      };

      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create routine");
      }

      router.push(`/${username}/routines`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          New Routine
        </h1>

        {error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}

        {/* Routine Name */}
        <div className="mt-4">
          <label
            htmlFor="routine-name"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Name
          </label>
          <input
            id="routine-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chest & Back"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Muscle Groups */}
        {muscleGroups.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Muscle Groups
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {muscleGroups.map((group) => {
                const isSelected = selectedGroups.includes(group._id);
                return (
                  <button
                    key={group._id}
                    type="button"
                    onClick={() => toggleGroup(group._id)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      isSelected
                        ? "text-white"
                        : "border border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300"
                    }`}
                    style={isSelected ? { backgroundColor: group.color } : undefined}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    {group.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Exercise Items */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Exercises ({items.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              + Add exercise
            </button>
          </div>

          {items.length === 0 && (
            <p className="mt-4 text-sm text-zinc-500">
              No exercises added yet. Tap &quot;+ Add exercise&quot; to get started.
            </p>
          )}

          <ul className="mt-3 space-y-2">
            {items.map((item, index) => (
              <li
                key={`${item.exerciseId}-${index}`}
                className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {item.exerciseName}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="shrink-0 text-xs text-red-500 hover:text-red-700"
                    aria-label={`Remove ${item.exerciseName}`}
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <select
                    value={item.Type}
                    onChange={(e) => updateItem(index, "Type", e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    aria-label="Type"
                  >
                    <option value="Push">Push</option>
                    <option value="Pull">Pull</option>
                    <option value="Pull-front">Pull-front</option>
                  </select>
                  <input
                    type="number"
                    value={item.Sets ?? ""}
                    onChange={(e) => updateItem(index, "Sets", e.target.value)}
                    placeholder="Sets"
                    className="w-14 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    aria-label="Sets"
                  />
                  <span className="self-center text-xs text-zinc-400">×</span>
                  <input
                    type="number"
                    value={item.Reps ?? ""}
                    onChange={(e) => updateItem(index, "Reps", e.target.value)}
                    placeholder="Reps"
                    className="w-14 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    aria-label="Reps"
                  />
                  <input
                    type="number"
                    value={item.Weight ?? ""}
                    onChange={(e) => updateItem(index, "Weight", e.target.value)}
                    placeholder="Weight"
                    className="w-16 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    aria-label="Weight"
                  />
                  <select
                    value={item.Unit}
                    onChange={(e) => updateItem(index, "Unit", e.target.value)}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    aria-label="Unit"
                  >
                    <option value="lb">lb</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            type="button"
            disabled={saving || !name.trim()}
            onClick={handleSave}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {saving ? "Saving…" : "Create Routine"}
          </button>
        </div>

        {/* Exercise Picker Modal */}
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
            <div className="w-full max-w-lg rounded-t-2xl bg-white p-4 dark:bg-zinc-900 sm:rounded-2xl sm:shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                  Add Exercise
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowPicker(false);
                    setSearch("");
                  }}
                  className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exercises…"
                autoFocus
                className="mt-3 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              />
              <ul className="mt-3 max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredExercises.length === 0 ? (
                  <li className="py-3 text-sm text-zinc-500">No exercises found.</li>
                ) : (
                  filteredExercises.map((ex) => (
                    <li key={ex._id}>
                      <button
                        type="button"
                        onClick={() => addExercise(ex)}
                        className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {ex.Name}
                          </p>
                          <p className="text-xs text-zinc-500">{ex.Target}</p>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
