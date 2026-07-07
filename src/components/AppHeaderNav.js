"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getActiveKey(pathname, username) {
  if (username) {
    if (pathname.startsWith(`/${username}/sessions`)) return "sessions";
    if (pathname.startsWith(`/${username}/routines`)) return "routines";
    if (pathname.startsWith(`/${username}/history`)) return "history";
  }
  if (pathname.startsWith("/exercises")) return "exercises";
  return null;
}

export default function AppHeaderNav({ links, username, brandHref, avatar, displayName }) {
  const pathname = usePathname();
  const active = getActiveKey(pathname, username);

  return (
    <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
      <Link
        href={brandHref}
        aria-current={pathname === brandHref ? "page" : undefined}
        className={
          pathname === brandHref
            ? "text-xl font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-50 dark:decoration-zinc-600"
            : "text-xl font-semibold text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
        }
      >
        Fitness Circle
      </Link>
      {links.length > 0 && (
        <nav className="flex items-center gap-1 text-sm">
          {links.map((item) => {
            const isActive = active === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "rounded-full bg-zinc-900 px-2.5 py-1 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "rounded-full px-2.5 py-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
      {avatar && displayName && (
        <span className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          <span>{avatar}</span>
          <span>{displayName}</span>
        </span>
      )}
    </div>
  );
}
