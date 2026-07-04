import { getRoutineStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/routines/[id]/reorder
 * Body: { exerciseIds: string[] }  — ordered list of exerciseId values for Items
 *
 * Because exerciseIds aren't necessarily unique (same exercise can appear twice),
 * we use positional index matching: the nth exerciseId maps to the nth Item slot.
 */
export async function PATCH(request, { params }) {
  const { id } = await params;
  const { exerciseIds } = await request.json();

  if (!Array.isArray(exerciseIds)) {
    return NextResponse.json({ error: "exerciseIds must be an array" }, { status: 400 });
  }

  const storage = getRoutineStorage();
  const routines = await storage.readAll();

  const routineIndex = routines.findIndex((r) => r._id === id);
  if (routineIndex === -1) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  const routine = routines[routineIndex];

  // Build a map from a stable key (exerciseId + originalIndex) → item
  const itemsByKey = Object.fromEntries(
    routine.Items.map((item, i) => [`${item.exerciseId}::${i}`, item]),
  );

  // The client sends exerciseIds in new order; we track which original index
  // was used so duplicates resolve correctly.
  const usedOriginalIndices = new Set();
  const reorderedItems = exerciseIds.map((exId) => {
    // Find the first original index for this exerciseId not yet consumed
    const originalIndex = routine.Items.findIndex(
      (item, i) => item.exerciseId === exId && !usedOriginalIndices.has(i),
    );
    usedOriginalIndices.add(originalIndex);
    return routine.Items[originalIndex];
  });

  // If any unmatched items remain (shouldn't happen but be safe), append them
  const remaining = routine.Items.filter((_, i) => !usedOriginalIndices.has(i));

  const updatedRoutine = { ...routine, Items: [...reorderedItems, ...remaining] };
  const updatedRoutines = [
    ...routines.slice(0, routineIndex),
    updatedRoutine,
    ...routines.slice(routineIndex + 1),
  ];

  await storage.writeAll(updatedRoutines);

  return NextResponse.json({ ok: true });
}
