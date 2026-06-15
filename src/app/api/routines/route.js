import { getRoutineStorage } from "@/lib/storage";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const storage = getRoutineStorage();
  const routines = await storage.readAll();
  return NextResponse.json(routines);
}
