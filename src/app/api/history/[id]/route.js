import {
  cancelWorkout,
  completeExercise,
  endWorkout,
  getActiveSessions,
} from "@/lib/workout";
import { getRoutineStorage } from "@/lib/storage";
import { getRoutineWithExercises } from "@/lib/routines";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { exerciseId, action } = body;

  if (action === "end") {
    const session = await endWorkout(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const [routines, activeSessions] = await Promise.all([
      getRoutineStorage().readAll(),
      getActiveSessions(),
    ]);

    return NextResponse.json({ session, routines, activeSessions });
  }

  if (action === "cancel") {
    const session = await cancelWorkout(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const [routines, activeSessions] = await Promise.all([
      getRoutineStorage().readAll(),
      getActiveSessions(),
    ]);

    return NextResponse.json({ session, routines, activeSessions });
  }

  if (!exerciseId) {
    return NextResponse.json(
      { error: "exerciseId or action is required" },
      { status: 400 },
    );
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
