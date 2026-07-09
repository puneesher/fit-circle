"use client";

import { useState } from "react";

export default function MusclesClient({ muscles: initialMuscles, muscleGroups }) {
  const [muscles, setMuscles] = useState(initialMuscles);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const groupMap = Object.fromEntries(muscleGroups.map((g) => [g._id, g]));

  const filtered = muscles.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/muscles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), group: newGroup || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create muscle.");
      }

      const created = await res.json();
      setMuscles((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setCreating(false);
      setNewName("");
      setNewGroup("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateGroup(muscleId, groupId) {
    try {
      const res = await fetch(`/api/muscles/${muscleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group: groupId || null }),
      });

      if (res.ok) {
        const updated = await res.json();
        setMuscles((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      }
    } catch {
      // silent
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Muscles
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{muscles.length} muscles</p>
        </div>
        <button
          type="button"
          onClick={() => { setCreating(true); setError(null); }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          aria-label="Create new muscle"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="10" y1="4" x2="10" y2="16" />
            <line x1="4" y1="10" x2="16" y2="10" />
          </svg>
        </button>
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">New Muscle</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="muscle-name" className="mb-1 block text-xs font-medium text-zinc-500">Name</label>
              <input
                id="muscle-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. biceps brachii"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                required
              />
            </div>
            <div>
              <label htmlFor="muscle-group" className="mb-1 block text-xs font-medium text-zinc-500">Muscle Group</label>
              <select
                id="muscle-group"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">None</option>
                {muscleGroups.map((g) => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => { setCreating(false); setError(null); }}
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
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search muscles…"
        className="mb-4 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">No muscles match your search.</p>
      ) : (
        <ul className="space-y-1">
          {filtered.map((muscle) => {
            const group = muscle.group ? groupMap[muscle.group] : null;
            return (
              <li
                key={muscle._id}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {group && (
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: group.color }}
                    title={group.name}
                  />
                )}
                <span className="flex-1 text-sm text-zinc-900 dark:text-zinc-50">
                  {muscle.name}
                </span>
                <select
                  value={muscle.group ?? ""}
                  onChange={(e) => updateGroup(muscle._id, e.target.value)}
                  className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <option value="">No group</option>
                  {muscleGroups.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
