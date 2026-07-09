"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.34 1.804A1 1 0 019.32 1h1.36a1 1 0 01.98.804l.295 1.473a7.042 7.042 0 011.37.79l1.43-.454a1 1 0 011.12.433l.68 1.178a1 1 0 01-.14 1.237l-1.136 1.018a7.09 7.09 0 010 1.58l1.136 1.019a1 1 0 01.14 1.237l-.68 1.177a1 1 0 01-1.12.434l-1.43-.454a7.042 7.042 0 01-1.37.79l-.294 1.473a1 1 0 01-.98.804H9.32a1 1 0 01-.98-.804l-.295-1.473a7.042 7.042 0 01-1.37-.79l-1.43.454a1 1 0 01-1.12-.434l-.68-1.177a1 1 0 01.14-1.237l1.136-1.018a7.09 7.09 0 010-1.581L3.585 5.96a1 1 0 01-.14-1.237l.68-1.178a1 1 0 011.12-.433l1.43.454a7.042 7.042 0 011.37-.79L8.34 1.804zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );
}

function getActiveKey(pathname, username) {
  if (username) {
    if (pathname.startsWith(`/${username}/workout`)) return "workout";
    if (pathname.startsWith(`/${username}/routines`)) return "routines";
    if (pathname.startsWith(`/${username}/history`)) return "history";
  }
  if (pathname.startsWith("/data/exercises")) return "exercises";
  return null;
}

export default function AppHeaderNav({ links, username, brandHref, avatar, displayName }) {
  const pathname = usePathname();
  const active = getActiveKey(pathname, username);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
        {avatar && displayName && (
          <span className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>{avatar}</span>
            <span>{displayName}</span>
          </span>
        )}
        {/* Gear menu */}
        {username && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Settings menu"
              aria-expanded={menuOpen}
              className={`rounded-full p-1.5 transition-colors ${
                menuOpen || active === "exercises"
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              ⚙️
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                <Link
                  href="/data/exercises"
                  className="block px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Exercises
                </Link>
                <Link
                  href="/data/muscles"
                  className="block px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Muscles
                </Link>
                <Link
                  href="/data/groups"
                  className="block px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Muscle Groups
                </Link>
                <Link
                  href="/users"
                  className="block px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Manage Users
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
