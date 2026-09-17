import { getUserStorage } from "@/lib/storage";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import ProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile | Fitness Circle",
};

export default async function ProfilePage({ params }) {
  const { username } = await params;

  // You can only edit your own profile: redirect to the logged-in user's page.
  const cookieStore = await cookies();
  const loggedIn = cookieStore.get("fc_user")?.value;
  if (loggedIn && loggedIn !== username) {
    redirect(`/${loggedIn}/profile`);
  }

  const users = await getUserStorage().readAll();
  const user = users.find((u) => u.username === username);

  if (!user) {
    notFound();
  }

  return <ProfileClient user={user} />;
}
