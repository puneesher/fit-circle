import { getUserStorage } from "@/lib/storage";
import { appendWeightEntry, SEX_OPTIONS } from "@/lib/profile";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const storage = getUserStorage();
  const users = await storage.readAll();
  return NextResponse.json(users);
}

export async function POST(request) {
  const storage = getUserStorage();
  const body = await request.json();
  const { username, displayName, avatar, sex, dateOfBirth, height, weightKg } =
    body;

  if (!username || !displayName || !avatar) {
    return NextResponse.json(
      { error: "username, displayName, and avatar are required" },
      { status: 400 },
    );
  }

  if (sex !== undefined && sex !== null && !SEX_OPTIONS.includes(sex)) {
    return NextResponse.json(
      { error: `sex must be one of: ${SEX_OPTIONS.join(", ")}` },
      { status: 400 },
    );
  }

  const users = await storage.readAll();

  const duplicate = users.find((u) => u.username === username);
  if (duplicate) {
    return NextResponse.json(
      { error: "username already exists" },
      { status: 409 },
    );
  }

  const newUser = {
    _id: username,
    username,
    displayName,
    avatar,
    sex: sex ?? null,
    dateOfBirth: dateOfBirth ?? null,
    height: height != null && height !== "" ? Number(height) : null,
    weight: weightKg != null && weightKg !== "" ? appendWeightEntry([], weightKg) : [],
  };
  users.push(newUser);
  await storage.writeAll(users);

  return NextResponse.json(newUser, { status: 201 });
}
