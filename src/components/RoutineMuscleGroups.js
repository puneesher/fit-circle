"use client";

import { useState } from "react";

export default function RoutineMuscleGroups({
  routineId,
  muscleGroups,
  initialSelected,
  username,
}) {
  const [selected, setSelected] = useState(initialSelected);
  const [saving, setSaving] = useState(false);

  async function toggle(groupId) {
    const prev = selected;
    const next = prev.includes(groupId)
      ? prev.filter((id) => id !== groupId)
      : [...prev, groupId];

    setSelected(next);
    setSaving(true);

    try {
      const res = await fetch(`/api/routines/${routineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muscleGroups: next, userId: username }),
      });

      if (!res.ok) {
        setSelected(prev);
      }
    } catch {
      setSelected(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 mb-4">
      <p className="mb-2 text-xs font-medium text-zinc-500">Muscle Groups</p>
      <div className="flex flex-wrap gap-2">
        {muscleGroups.map((group) => {
          const isSelected = selected.includes(group._id);
          return (
            <button
              key={group._id}
              type="button"
              disabled={saving}
              onClick={() => toggle(group._id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors disabled:opacity-70 ${
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
  );
}
