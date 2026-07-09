import { getMuscleGroupStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const storage = getMuscleGroupStorage();
  const groups = await storage.readAll();
  return NextResponse.json(groups);
}

export async function POST(request) {
  const body = await request.json();
  const { name, color, zones } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const storage = getMuscleGroupStorage();
  const all = await storage.readAll();

  const id = name.trim().toLowerCase().replace(/\s+/g, "-");

  if (all.find((g) => g._id === id)) {
    return NextResponse.json({ error: "Muscle group already exists" }, { status: 409 });
  }

  const newGroup = {
    _id: id,
    name: name.trim(),
    color: color?.trim() || "#6b7280",
    zones: zones ?? [],
  };

  all.push(newGroup);
  await storage.writeAll(all);

  return NextResponse.json(newGroup, { status: 201 });
}
