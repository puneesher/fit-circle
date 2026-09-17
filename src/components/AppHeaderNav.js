"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

function getActiveKey(pathname, username) {
  if (username) {
    if (pathname.startsWith(`/${username}/workout`)) return "workout";
    if (pathname.startsWith(`/${username}/routines`)) return "routines";
    if (pathname.startsWith(`/${username}/history`)) return "history";
  }
  if (pathname.startsWith("/data/exercises")) return "exercises";
  return null;
}

const menuItemClass =
  "block px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800";

export default function AppHeaderNav({ links, username, brandHref, profileHref, avatar, displayName }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = getActiveKey(pathname, username);
  const [gearOpen, setGearOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const gearRef = useRef(null);
  const userRef = useRef(null);

  function handleLogout() {
    // Clear the session cookie and return to the user selection screen.
    document.cookie = "fc_user=; path=/; max-age=0";
    setUserOpen(false);
    router.push("/");
  }

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e) {
      if (gearRef.current && !gearRef.current.contains(e.target)) {
        setGearOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    }
    if (gearOpen || userOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [gearOpen, userOpen]);

  // Close menus on route change. Adjusting state during render (rather than in
  // an effect) keeps the linter happy and avoids an extra render pass.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setGearOpen(false);
    setUserOpen(false);
  }

  return (
    <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
      <Link
        href={brandHref}
        aria-current={pathname === brandHref ? "page" : undefined}
        className="shrink-0"
      >
        <Image
          src="/fc-logo.png"
          alt="Fitness Circle"
          width={128}
          height={68}
          className="h-8 w-auto"
          priority
          suppressHydrationWarning
        />
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
      <div className="flex items-center gap-2">
        {/* User menu */}
        {username && avatar && displayName && (
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setUserOpen((o) => !o)}
              aria-label="User menu"
              aria-expanded={userOpen}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm transition-colors ${
                userOpen
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <span>{avatar}</span>
              <span>{displayName}</span>
            </button>
            {userOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                {profileHref && (
                  <Link href={profileHref} className={menuItemClass}>
                    My Profile
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full border-t border-zinc-100 px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
        {/* Gear menu */}
        {username && (
          <div className="relative" ref={gearRef}>
            <button
              type="button"
              onClick={() => setGearOpen((o) => !o)}
              aria-label="Settings menu"
              aria-expanded={gearOpen}
              className={`rounded-full p-1.5 transition-colors ${
                gearOpen || active === "exercises"
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              ⚙️
            </button>
            {gearOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <Link href="/data/exercises" className={menuItemClass}>
                  Exercises
                </Link>
                <Link href="/data/muscles" className={menuItemClass}>
                  Muscles
                </Link>
                <Link href="/data/groups" className={menuItemClass}>
                  Muscle Groups
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
