import { getMuscleStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();

  const storage = getMuscleStorage();
  const all = await storage.readAll();
  const index = all.findIndex((m) => m._id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Muscle not found" }, { status: 404 });
  }

  if (body.name !== undefined) all[index].name = body.name;
  if (body.group !== undefined) all[index].group = body.group;

  await storage.writeAll(all);
  return NextResponse.json(all[index]);
}

export async function DELETE(_request, { params }) {
  const { id } = await params;

  const storage = getMuscleStorage();
  const all = await storage.readAll();
  const index = all.findIndex((m) => m._id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Muscle not found" }, { status: 404 });
  }

  const [deleted] = all.splice(index, 1);
  await storage.writeAll(all);
  return NextResponse.json(deleted);
}
