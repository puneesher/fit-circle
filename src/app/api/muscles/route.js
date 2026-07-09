import { getMuscleStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const muscles = await getMuscleStorage().readAll();
  return NextResponse.json(muscles);
}

export async function POST(request) {
  const body = await request.json();
  const { name, group } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const storage = getMuscleStorage();
  const all = await storage.readAll();
  const id = name.trim().toLowerCase().replace(/\s+/g, "-");

  if (all.find((m) => m._id === id)) {
    return NextResponse.json({ error: "Muscle already exists" }, { status: 409 });
  }

  const newMuscle = { _id: id, name: name.trim().toLowerCase(), group: group ?? null };
  all.push(newMuscle);
  await storage.writeAll(all);

  return NextResponse.json(newMuscle, { status: 201 });
}
