"use client";

import { useRouter } from "next/navigation";

export default function LoginClient({ users }) {
  const router = useRouter();

  function handleSelect(username) {
    document.cookie = `fc_user=${username}; path=/`;
    router.push(`/${username}/workout`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm px-4">
        <h1 className="mb-8 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Who&apos;s working out?
        </h1>
        <div className="grid gap-4">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => handleSelect(user.username)}
              className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <span className="text-3xl">{user.avatar}</span>
              <span className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                {user.displayName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
