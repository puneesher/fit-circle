import { getUserStorage } from "@/lib/storage";
import AppHeaderNav from "./AppHeaderNav";

export default async function AppHeader({ username }) {
  let avatar = null;
  let displayName = null;
  let links = [];
  let brandHref = "/";

  if (username) {
    // Fetch user data server-side
    try {
      const users = await getUserStorage().readAll();
      const user = users.find((u) => u.username === username);
      if (user) {
        avatar = user.avatar;
        displayName = user.displayName;
      }
    } catch {
      // If storage fails, render header without user info
    }

    brandHref = `/${username}/workout`;
    links = [
      { href: `/${username}/workout`, label: "Workout", key: "workout" },
      { href: `/${username}/routines`, label: "Routines", key: "routines" },
      { href: `/${username}/history`, label: "History", key: "history" },
    ];
  }

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <AppHeaderNav
        links={links}
        username={username || null}
        brandHref={brandHref}
        avatar={avatar}
        displayName={displayName}
      />
    </header>
  );
}
