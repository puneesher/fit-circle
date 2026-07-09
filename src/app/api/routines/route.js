import { getRoutineStorage } from "@/lib/storage";
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
  const storage = getRoutineStorage();
  const routines = await storage.readByUser(userId);
  return NextResponse.json(routines);
}

export async function POST(request) {
  const body = await request.json();
  const { name, items, userId, muscleGroups } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const newRoutine = {
    _id: Date.now(),
    Name: name,
    Items: items ?? [],
    muscleGroups: muscleGroups ?? [],
    userId,
  };

  const storage = getRoutineStorage();
  const all = await storage.readAll();
  all.push(newRoutine);
  await storage.writeAll(all);

  return NextResponse.json(newRoutine, { status: 201 });
}
