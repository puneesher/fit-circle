import { getRoutineStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/routines/[id]/items/[index]
 * Body: partial item fields — Type, Sets, Reps, Weight, Unit, Note
 * Updates the item at position [index] in the routine's Items array.
 */
export async function PATCH(request, { params }) {
  const { id, index: indexStr } = await params;
  const updates = await request.json();
  const index = Number(indexStr);

  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Invalid index" }, { status: 400 });
  }

  const storage = getRoutineStorage();
  const routines = await storage.readAll();

  const routineIndex = routines.findIndex((r) => r._id === id);
  if (routineIndex === -1) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  const routine = routines[routineIndex];

  if (index >= routine.Items.length) {
    return NextResponse.json({ error: "Item index out of range" }, { status: 404 });
  }

  const updatedItem = { ...routine.Items[index] };

  // Accept both capitalized (Type) and lowercase (type) keys from the client
  const get = (cap, low) => updates[cap] !== undefined ? updates[cap] : updates[low];

  const type = get("Type", "type");
  const sets = get("Sets", "sets");
  const reps = get("Reps", "reps");
  const weight = get("Weight", "weight");
  const unit = get("Unit", "unit");
  const note = get("Note", "note");
  const unilateral = get("Unilateral", "unilateral");

  if (type !== undefined) updatedItem.Type = type;
  if (sets !== undefined) updatedItem.Sets = sets === "" ? undefined : Number(sets);
  if (reps !== undefined) updatedItem.Reps = reps === "" ? undefined : Number(reps);
  if (weight !== undefined) updatedItem.Weight = weight === "" || weight == null ? undefined : Number(weight);
  if (unit !== undefined) updatedItem.Unit = unit || undefined;
  if (note !== undefined) updatedItem.Note = String(note).trim() || undefined;
  if (unilateral !== undefined) updatedItem.Unilateral = Boolean(unilateral) || undefined;

  // Remove undefined keys to keep data clean
  Object.keys(updatedItem).forEach((k) => updatedItem[k] === undefined && delete updatedItem[k]);

  const newItems = [...routine.Items];
  newItems[index] = updatedItem;

  const updatedRoutines = [...routines];
  updatedRoutines[routineIndex] = { ...routine, Items: newItems };

  await storage.writeAll(updatedRoutines);

  return NextResponse.json(updatedItem);
}
