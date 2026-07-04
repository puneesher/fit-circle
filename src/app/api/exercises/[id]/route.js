import { getExerciseStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const updates = await request.json();

  const storage = getExerciseStorage();
  const exercises = await storage.readAll();

  const index = exercises.findIndex((ex) => ex._id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  }

  const updated = { ...exercises[index], ...updates, _id: id };
  const updatedExercises = [
    ...exercises.slice(0, index),
    updated,
    ...exercises.slice(index + 1),
  ];

  await storage.writeAll(updatedExercises);
  return NextResponse.json(updated);
}
