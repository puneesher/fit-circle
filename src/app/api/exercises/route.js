import { getExerciseStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET() {
  const storage = getExerciseStorage();
  const exercises = await storage.readAll();
  return NextResponse.json(exercises);
}

export async function POST(request) {
  const storage = getExerciseStorage();
  const body = await request.json();
  const exercises = await storage.readAll();
  exercises.push(body);
  await storage.writeAll(exercises);
  return NextResponse.json(body, { status: 201 });
}
