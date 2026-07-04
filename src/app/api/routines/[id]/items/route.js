import { getRoutineStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/routines/[id]/items
 * Body: { exerciseId, Type, Sets, Reps, Weight, Unit, Note }
 * Appends a new item to the routine's Items array and persists.
 */
export async function POST(request, { params }) {
  const { id } = await params;
  const item = await request.json();

  if (!item.exerciseId) {
    return NextResponse.json({ error: "exerciseId is required" }, { status: 400 });
  }

  const storage = getRoutineStorage();
  const routines = await storage.readAll();

  const routineIndex = routines.findIndex((r) => r._id === id);
  if (routineIndex === -1) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  const routine = routines[routineIndex];
  const newItem = {
    exerciseId: item.exerciseId,
    Type: item.Type ?? "Push",
    ...(item.Sets != null && { Sets: Number(item.Sets) }),
    ...(item.Reps != null && { Reps: Number(item.Reps) }),
    ...(item.Weight != null && item.Weight !== "" && { Weight: Number(item.Weight) }),
    ...(item.Unit && { Unit: item.Unit }),
    ...(item.Note && { Note: item.Note }),
  };

  const updatedRoutine = { ...routine, Items: [...routine.Items, newItem] };
  const updatedRoutines = [
    ...routines.slice(0, routineIndex),
    updatedRoutine,
    ...routines.slice(routineIndex + 1),
  ];

  await storage.writeAll(updatedRoutines);

  return NextResponse.json(newItem, { status: 201 });
}
