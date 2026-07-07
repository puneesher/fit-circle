import { getRoutineWithExercises } from "@/lib/routines";
import { getRoutineStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const routine = await getRoutineWithExercises(id);

  if (!routine) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  return NextResponse.json(routine);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { userId, ...updates } = body;

  const storage = getRoutineStorage();
  const all = await storage.readAll();
  const index = all.findIndex((r) => String(r._id) === String(id));

  if (index === -1) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  all[index] = { ...all[index], ...updates };
  await storage.writeAll(all);

  return NextResponse.json(all[index]);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { userId } = body;

  const storage = getRoutineStorage();
  const all = await storage.readAll();
  const index = all.findIndex((r) => String(r._id) === String(id));

  if (index === -1) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  const [deleted] = all.splice(index, 1);
  await storage.writeAll(all);

  return NextResponse.json(deleted);
}
