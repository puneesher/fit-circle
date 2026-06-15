import { getRoutineWithExercises } from "@/lib/routines";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  const { id } = await params;
  const routine = await getRoutineWithExercises(id);

  if (!routine) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  return NextResponse.json(routine);
}
