"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getLinkClasses(isActive: boolean) {
  if (isActive) {
    return "rounded-md border border-indigo-300/70 bg-indigo-500/25 px-3 py-1.5 text-white";
  }

  return "rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10";
}

export function SiteNavbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-indigo-300/20 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Homeschool Coding Club</p>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className={getLinkClasses(pathname === "/")}>
            Home
          </Link>
          <Link href="/about-the-teacher" className={getLinkClasses(pathname === "/about-the-teacher")}>
            About the Teacher
          </Link>
          <Link href="/auth/login" className={getLinkClasses(pathname === "/auth/login")}>
            Login
          </Link>
          <Link
            href="/auth/sign-up"
            className={pathname === "/auth/sign-up"
              ? "rounded-md border border-indigo-300/70 bg-indigo-500/25 px-3 py-1.5 font-medium text-white"
              : "rounded-md bg-indigo-500 px-3 py-1.5 font-medium text-white hover:bg-indigo-400"}
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
