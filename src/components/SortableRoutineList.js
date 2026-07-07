"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GripIcon from "@/components/GripIcon";

// DndContext generates random IDs during init — skip SSR to avoid hydration mismatch
const DndContext = dynamic(
  () => import("@dnd-kit/core").then((m) => m.DndContext),
  { ssr: false },
);

function SortableRoutineItem({ routine, username }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routine._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border bg-white px-5 py-4 dark:bg-zinc-900 ${
        isDragging
          ? "border-zinc-300 shadow-lg dark:border-zinc-600"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {/* Drag handle */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${routine.Name}`}
        className="cursor-grab touch-none active:cursor-grabbing"
      >
        <GripIcon />
      </button>

      {/* Routine link */}
      <Link
        href={username ? `/${username}/routines/${routine._id}` : `/routines/${routine._id}`}
        className="min-w-0 flex-1"
        tabIndex={isDragging ? -1 : 0}
      >
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          {routine.Name}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {routine.Items.length} exercises
        </p>
      </Link>
    </li>
  );
}

export default function SortableRoutineList({ initialRoutines, username }) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = routines.findIndex((r) => r._id === active.id);
      const newIndex = routines.findIndex((r) => r._id === over.id);
      const reordered = arrayMove(routines, oldIndex, newIndex);

      // Optimistic update
      setRoutines(reordered);

      setSaving(true);
      try {
        await fetch("/api/routines/reorder", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: reordered.map((r) => r._id), userId: username }),
        });
      } finally {
        setSaving(false);
      }
    },
    [routines, username],
  );

  return (
    <>
      {saving && (
        <p className="mt-2 text-xs text-zinc-400" aria-live="polite">
          Saving order…
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={routines.map((r) => r._id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-6 space-y-3">
            {routines.map((routine) => (
              <SortableRoutineItem key={routine._id} routine={routine} username={username} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}
