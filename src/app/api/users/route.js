import { getUserStorage } from "@/lib/storage";
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
  const { username, displayName, avatar } = body;

  if (!username || !displayName || !avatar) {
    return NextResponse.json(
      { error: "username, displayName, and avatar are required" },
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

  const newUser = { _id: username, username, displayName, avatar };
  users.push(newUser);
  await storage.writeAll(users);

  return NextResponse.json(newUser, { status: 201 });
}
