"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getLinkClasses(isActive: boolean) {
  if (isActive) {
    return "inline-flex min-h-11 items-center rounded-md border border-indigo-300/70 bg-indigo-500/25 px-3 py-1.5 text-white whitespace-nowrap";
  }

  return "inline-flex min-h-11 items-center rounded-md border border-white/20 px-3 py-1.5 whitespace-nowrap hover:bg-white/10";
}

function signUpButtonClasses(isActive: boolean) {
  return isActive
    ? "inline-flex min-h-11 items-center rounded-md border border-indigo-300/70 bg-indigo-500/25 px-3 py-1.5 font-medium text-white whitespace-nowrap"
    : "inline-flex min-h-11 items-center rounded-md bg-indigo-500 px-3 py-1.5 font-medium text-white whitespace-nowrap hover:bg-indigo-400";
}

export function SiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (isMounted) {
        setIsAuthenticated(Boolean(data.user));
      }
    };

    void loadUser();

    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session?.user));
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    closeMenu();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="border-b border-indigo-300/20 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Homeschool Coding Club</p>
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-3 text-sm text-white md:hidden"
            aria-controls="mobile-site-menu"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            Menu
          </button>
        </div>
        <nav className="mt-3 hidden items-center gap-3 text-sm md:flex">
          <Link href="/" className={getLinkClasses(pathname === "/")}>
            Home
          </Link>
          <Link href="/about-the-teacher" className={getLinkClasses(pathname === "/about-the-teacher")}>
            About the Teacher
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/protected" className={getLinkClasses(pathname.startsWith("/protected"))}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={getLinkClasses(pathname === "/auth/login")}>
                Login
              </Link>
              <Link href="/auth/sign-up" className={signUpButtonClasses(pathname === "/auth/sign-up")}>
                Sign up
              </Link>
            </>
          )}
        </nav>
        {isMenuOpen ? (
          <nav id="mobile-site-menu" className="mt-3 flex flex-col gap-2 text-sm md:hidden">
            <Link href="/" className={getLinkClasses(pathname === "/")} onClick={closeMenu}>
              Home
            </Link>
            <Link href="/about-the-teacher" className={getLinkClasses(pathname === "/about-the-teacher")} onClick={closeMenu}>
              About the Teacher
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/protected" className={getLinkClasses(pathname.startsWith("/protected"))} onClick={closeMenu}>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-3 py-1.5 text-left hover:bg-white/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={getLinkClasses(pathname === "/auth/login")} onClick={closeMenu}>
                  Login
                </Link>
                <Link
                  href="/auth/sign-up"
                  className={signUpButtonClasses(pathname === "/auth/sign-up")}
                  onClick={closeMenu}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
