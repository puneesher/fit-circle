"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
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
import WorkoutCard from "@/components/WorkoutCard";
import GripIcon from "@/components/GripIcon";
import AddExerciseDialog from "@/components/AddExerciseDialog";
import RoutineItemEditor from "@/components/RoutineItemEditor";

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61a.75.75 0 0 1-.37.199l-3.25.65a.75.75 0 0 1-.877-.877l.65-3.25a.75.75 0 0 1 .199-.37l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L3.5 11.06l-.39 1.95 1.95-.39 8.573-8.573a.25.25 0 0 0 0-.354l-1.086-1.086-.12-.12Z" />
    </svg>
  );
}

// DndContext generates random IDs during init — skip SSR to avoid hydration mismatch
const DndContext = dynamic(
  () => import("@dnd-kit/core").then((m) => m.DndContext),
  { ssr: false },
);

/**
 * Each item needs a stable sortable ID. Because the same exercise can appear
 * more than once in a routine, we append the original index to make it unique.
 */
function itemSortId(item, index) {
  return `${item.exerciseId}::${index}`;
}

function SortableExerciseItem({ sortId, item, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch overflow-hidden rounded-xl border bg-white dark:bg-zinc-900 ${
        isDragging
          ? "border-zinc-300 shadow-lg dark:border-zinc-600"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {/* Drag handle — sits in a narrow left strip */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${item.Exercise?.Name ?? item.exerciseId}`}
        className="flex cursor-grab items-center px-2 touch-none active:cursor-grabbing"
      >
        <GripIcon />
      </button>

      {/* Exercise card */}
      <div className="min-w-0 flex-1">
        <WorkoutCard item={item} />
      </div>

      {/* Edit button */}
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${item.Exercise?.Name ?? item.exerciseId}`}
        className="flex cursor-pointer items-center px-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
      >
        <PencilIcon />
      </button>
    </li>
  );
}

export default function SortableExerciseList({ routineId, initialItems }) {
  // Attach stable sort IDs to each item
  const [items, setItems] = useState(() =>
    initialItems.map((item, i) => ({ ...item, _sortId: itemSortId(item, i) })),
  );
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

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

      const oldIndex = items.findIndex((item) => item._sortId === active.id);
      const newIndex = items.findIndex((item) => item._sortId === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);

      // Optimistic update
      setItems(reordered);

      setSaving(true);
      try {
        await fetch(`/api/routines/${routineId}/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseIds: reordered.map((item) => item.exerciseId),
          }),
        });
      } finally {
        setSaving(false);
      }
    },
    [items, routineId],
  );

  function handleAdded(newItem) {
    setItems((prev) => [
      ...prev,
      { ...newItem, _sortId: itemSortId(newItem, prev.length) },
    ]);
  }

  function handleItemSaved(updatedItem) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === editingIndex
          ? { ...item, ...updatedItem, Exercise: item.Exercise }
          : item,
      ),
    );
    setEditingIndex(null);
  }

  const editingItem = editingIndex !== null ? items[editingIndex] : null;

  return (
    <>
      {saving && (
        <p className="mt-2 text-xs text-zinc-400" aria-live="polite">
          Saving order…
        </p>
      )}

      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3Z" />
        </svg>
        Add exercise
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item._sortId)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="mt-4 space-y-4">
            {items.map((item, i) => (
              <SortableExerciseItem
                key={item._sortId}
                sortId={item._sortId}
                item={item}
                onEdit={() => setEditingIndex(i)}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <AddExerciseDialog
        open={dialogOpen}
        routineId={routineId}
        onClose={() => setDialogOpen(false)}
        onAdded={handleAdded}
      />

      <RoutineItemEditor
        item={editingItem}
        itemIndex={editingIndex}
        routineId={routineId}
        open={editingIndex !== null}
        onCancel={() => setEditingIndex(null)}
        onSaved={handleItemSaved}
      />
    </>
  );
}
