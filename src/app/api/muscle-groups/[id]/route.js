import { getMuscleGroupStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { name, color, zones } = body;

  const storage = getMuscleGroupStorage();
  const all = await storage.readAll();
  const index = all.findIndex((g) => g._id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Muscle group not found" }, { status: 404 });
  }

  if (name !== undefined) all[index].name = name;
  if (color !== undefined) all[index].color = color;
  if (zones !== undefined) all[index].zones = zones;

  await storage.writeAll(all);

  return NextResponse.json(all[index]);
}

export async function DELETE(_request, { params }) {
  const { id } = await params;

  const storage = getMuscleGroupStorage();
  const all = await storage.readAll();
  const index = all.findIndex((g) => g._id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Muscle group not found" }, { status: 404 });
  }

  const [deleted] = all.splice(index, 1);
  await storage.writeAll(all);

  return NextResponse.json(deleted);
}
