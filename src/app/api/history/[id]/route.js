import {
  cancelWorkout,
  completeExercise,
  deleteWorkout,
  editCompletedItem,
  endWorkout,
  getActiveSessions,
  setExerciseWeight,
} from "@/lib/workout";
import { getRoutineStorage } from "@/lib/storage";
import { getRoutineWithExercises } from "@/lib/routines";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { exerciseId, action, weight, userId } = body;

  if (action === "editItem") {
    const { itemIndex, updates } = body;
    if (itemIndex == null || !updates) {
      return NextResponse.json(
        { error: "itemIndex and updates are required" },
        { status: 400 },
      );
    }
    const result = await editCompletedItem(id, Number(itemIndex), updates, userId);
    if (!result) {
      return NextResponse.json({ error: "Session or item not found" }, { status: 404 });
    }
    return NextResponse.json(result);
  }

  if (action === "setWeight") {
    if (!exerciseId) {
      return NextResponse.json(
        { error: "exerciseId is required" },
        { status: 400 },
      );
    }

    const { sets, reps } = body;
    const result = await setExerciseWeight(id, exerciseId, weight != null ? Number(weight) : null, userId, sets != null ? Number(sets) : null, reps != null ? Number(reps) : null);
    if (!result) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  }

  if (action === "end") {
    const session = await endWorkout(id, userId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const [routines, activeSessions] = await Promise.all([
      userId ? getRoutineStorage().readByUser(userId) : getRoutineStorage().readAll(),
      getActiveSessions(userId),
    ]);

    return NextResponse.json({ session, routines, activeSessions });
  }

  if (action === "cancel") {
    const session = await cancelWorkout(id, userId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const [routines, activeSessions] = await Promise.all([
      userId ? getRoutineStorage().readByUser(userId) : getRoutineStorage().readAll(),
      getActiveSessions(userId),
    ]);

    return NextResponse.json({ session, routines, activeSessions });
  }

  if (action === "delete") {
    const session = await deleteWorkout(id, userId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const [routines, activeSessions] = await Promise.all([
      userId ? getRoutineStorage().readByUser(userId) : getRoutineStorage().readAll(),
      getActiveSessions(userId),
    ]);

    return NextResponse.json({ session, routines, activeSessions });
  }

  if (!exerciseId) {
    return NextResponse.json(
      { error: "exerciseId or action is required" },
      { status: 400 },
    );
  }

  const result = await completeExercise(id, exerciseId, userId);

  if (!result) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const routines = userId
    ? await getRoutineStorage().readByUser(userId)
    : await getRoutineStorage().readAll();

  return NextResponse.json({
    ...result,
    routines,
  });
}
