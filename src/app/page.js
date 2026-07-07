import LoginClient from "./login-client";
import { getUserStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fitness Circle",
};

export default async function LoginPage() {
  const users = await getUserStorage().readAll();
  return <LoginClient users={users} />;
}
