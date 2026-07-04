import { getRoutineStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/routines/reorder
 * Body: { ids: string[] }  — full ordered list of routine IDs
 */
export async function PATCH(request) {
  const { ids } = await request.json();

  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids must be an array" }, { status: 400 });
  }

  const storage = getRoutineStorage();
  const routines = await storage.readAll();

  // Build a lookup so we can reorder without losing any routine data
  const byId = Object.fromEntries(routines.map((r) => [r._id, r]));

  // Keep only IDs that actually exist; append any that weren't in the payload
  const reordered = [
    ...ids.filter((id) => byId[id]).map((id) => byId[id]),
    ...routines.filter((r) => !ids.includes(r._id)),
  ];

  await storage.writeAll(reordered);

  return NextResponse.json({ ok: true });
}
