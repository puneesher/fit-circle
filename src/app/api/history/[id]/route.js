import { completeExercise } from "@/lib/workout";
import { getRoutineStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { exerciseId } = body;

  if (!exerciseId) {
    return NextResponse.json({ error: "exerciseId is required" }, { status: 400 });
  }

  const result = await completeExercise(id, exerciseId);

  if (!result) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const routines = await getRoutineStorage().readAll();

  return NextResponse.json({
    ...result,
    routines,
  });
}
