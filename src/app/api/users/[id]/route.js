import { getUserStorage } from "@/lib/storage";
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
  const { displayName, avatar } = body;

  const updatedUser = { ...users[userIndex] };
  if (displayName !== undefined) updatedUser.displayName = displayName;
  if (avatar !== undefined) updatedUser.avatar = avatar;

  users[userIndex] = updatedUser;
  await storage.writeAll(users);

  return NextResponse.json(updatedUser);
}
