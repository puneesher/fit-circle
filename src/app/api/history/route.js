import { getHistoryStorage } from "@/lib/storage";
import { getRoutineWithExercises } from "@/lib/routines";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId query param is required" },
      { status: 400 }
    );
  }

  const history = await getHistoryStorage().readByUser(userId);

  // Find the most recent active session for this user
  const activeSessions = history
    .filter((s) => s.status === "active")
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  const activeSession = activeSessions[0] ?? null;

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
  const { routineId, userId } = body;

  if (!routineId) {
    return NextResponse.json({ error: "routineId is required" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const { startWorkoutDay } = await import("@/lib/workout");
  const result = await startWorkoutDay(routineId, userId);

  if (!result) {
    return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  }

  return NextResponse.json(result, { status: 201 });
}
