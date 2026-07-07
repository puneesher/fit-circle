import { getUserStorage } from "@/lib/storage";
import UsersClient from "./users-client";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Users | Fitness Circle",
};

export default async function UsersPage() {
  const users = await getUserStorage().readAll();
  return (
    <>
      <AppHeader />
      <UsersClient users={users} />
    </>
  );
}
