import { getActiveSession } from "@/lib/workout";
import { getHistoryStorage } from "@/lib/storage";
import { getRoutineWithExercises } from "@/lib/routines";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const history = await getHistoryStorage().readAll();
  const activeSession = await getActiveSession();
  let activeRoutine = null;

  if (activeSession) {
    activeRoutine = await getRoutineWithExercises(activeSession.routineId);
  }

  return NextResponse.json({
    history,
    activeSession,
    activeRoutine,
  });
}

export async function POST(request) {
  const body = await request.json();
  const { routineId } = body;

  if (!routineId) {
    return NextResponse.json({ error: "routineId is required" }, { status: 400 });
  }

  const { startWorkoutDay } = await import("@/lib/workout");
  const result = await startWorkoutDay(routineId);

  if (!result) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  return NextResponse.json(result, { status: 201 });
}
