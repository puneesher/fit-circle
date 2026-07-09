"use client";

import { useState } from "react";
import BodyMap, { ALL_ZONES } from "@/components/BodyMap";

const COLORS = [
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Green", value: "#22c55e" },
  { label: "Emerald", value: "#10b981" },
  { label: "Lime", value: "#84cc16" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  { label: "Gray", value: "#6b7280" },
];

function buildZoneColorMap(groups) {
  const map = {};
  for (const group of groups) {
    if (group.zones) {
      for (const zone of group.zones) {
        map[zone] = group.color;
      }
    }
  }
  return map;
}

export default function MuscleGroupsClient({ groups: initialGroups }) {
  const [groups, setGroups] = useState(initialGroups);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [zones, setZones] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const zoneColors = buildZoneColorMap(groups);

  function toggleZone(zoneId) {
    setZones((prev) =>
      prev.includes(zoneId)
        ? prev.filter((z) => z !== zoneId)
        : [...prev, zoneId]
    );
  }

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setName("");
    setColor("#3b82f6");
    setZones([]);
    setError(null);
  }

  function startEdit(group) {
    setEditingId(group._id);
    setCreating(false);
    setName(group.name);
    setColor(group.color);
    setZones(group.zones ?? []);
    setError(null);
  }

  function cancelForm() {
    setCreating(false);
    setEditingId(null);
    setError(null);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/muscle-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color, zones }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create muscle group.");
      }

      const created = await res.json();
      setGroups((prev) => [...prev, created]);
      cancelForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/muscle-groups/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color, zones }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update muscle group.");
      }

      const updated = await res.json();
      setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
      cancelForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Build a preview zone color map for the form (current selection)
  const previewZoneColors = { ...zoneColors };
  if (creating || editingId) {
    // Remove zones from the group being edited
    if (editingId) {
      const editGroup = groups.find((g) => g._id === editingId);
      if (editGroup?.zones) {
        for (const z of editGroup.zones) {
          delete previewZoneColors[z];
        }
      }
    }
    // Add current selection
    for (const z of zones) {
      previewZoneColors[z] = color;
    }
  }

  const isFormOpen = creating || editingId;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Muscle Groups
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Tap body zones to assign them to a group</p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={startCreate}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            aria-label="Create new muscle group"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="10" y1="4" x2="10" y2="16" />
              <line x1="4" y1="10" x2="16" y2="10" />
            </svg>
          </button>
        )}
      </div>

      {/* Body map */}
      <div className="mb-6">
        <BodyMap
          zoneColors={previewZoneColors}
          onZoneClick={isFormOpen ? toggleZone : undefined}
        />
      </div>

      {/* Create/Edit form */}
      {isFormOpen && (
        <form
          onSubmit={creating ? handleCreate : handleUpdate}
          className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">
            {creating ? "New Muscle Group" : "Edit Muscle Group"}
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="group-name" className="mb-1 block text-xs font-medium text-zinc-500">
                Name
              </label>
              <input
                id="group-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arm"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
                required
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-500">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    title={c.label}
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${
                      color === c.value
                        ? "scale-110 border-zinc-900 dark:border-zinc-100"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-500">
                Zones ({zones.length} selected) — tap the body map above
              </p>
              <div className="flex flex-wrap gap-1.5">
                {zones.map((z) => (
                  <span
                    key={z}
                    className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: color }}
                  >
                    {z}
                  </span>
                ))}
                {zones.length === 0 && (
                  <span className="text-xs text-zinc-400">None selected</span>
                )}
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={cancelForm}
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
              {saving ? "Saving…" : creating ? "Create" : "Save"}
            </button>
          </div>
        </form>
      )}

      {/* Groups list */}
      {groups.length === 0 && !isFormOpen ? (
        <p className="text-sm text-zinc-500">No muscle groups yet. Tap + to create one.</p>
      ) : (
        <ul className="space-y-2">
          {groups.map((group) => (
            <li
              key={group._id}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: group.color }}
              />
              <span className="flex-1 font-medium text-zinc-900 dark:text-zinc-50">
                {group.name}
              </span>
              {group.zones?.length > 0 && (
                <span className="text-xs text-zinc-500">
                  {group.zones.length} zone{group.zones.length === 1 ? "" : "s"}
                </span>
              )}
              <button
                type="button"
                onClick={() => startEdit(group)}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
