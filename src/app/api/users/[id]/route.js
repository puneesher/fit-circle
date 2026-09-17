import { getUserStorage } from "@/lib/storage";
import { appendWeightEntry, SEX_OPTIONS } from "@/lib/profile";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const storage = getUserStorage();
  const users = await storage.readAll();

  const userIndex = users.findIndex((u) => u._id === id);
  if (userIndex === -1) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  const body = await request.json();
  const { displayName, avatar, sex, dateOfBirth, height, weightKg } = body;

  if (sex !== undefined && sex !== null && !SEX_OPTIONS.includes(sex)) {
    return NextResponse.json(
      { error: `sex must be one of: ${SEX_OPTIONS.join(", ")}` },
      { status: 400 },
    );
  }

  const updatedUser = { ...users[userIndex] };

  if (displayName !== undefined) updatedUser.displayName = displayName;
  if (avatar !== undefined) updatedUser.avatar = avatar;
  if (sex !== undefined) updatedUser.sex = sex;
  if (dateOfBirth !== undefined) updatedUser.dateOfBirth = dateOfBirth;
  if (height !== undefined) {
    updatedUser.height =
      height != null && height !== "" ? Number(height) : null;
  }

  // Registering a weight change appends a dated entry so history is preserved.
  if (weightKg != null && weightKg !== "") {
    updatedUser.weight = appendWeightEntry(updatedUser.weight, weightKg);
  }

  users[userIndex] = updatedUser;
  await storage.writeAll(users);

  return NextResponse.json(updatedUser);
}
