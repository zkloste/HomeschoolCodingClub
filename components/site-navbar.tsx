"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function getLinkClasses(isActive: boolean) {
  if (isActive) {
    return "inline-flex min-h-11 items-center rounded-md border border-zinc-500 bg-zinc-800 px-3 py-1.5 text-zinc-100 whitespace-nowrap";
  }

  return "inline-flex min-h-11 items-center rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-300 whitespace-nowrap hover:border-zinc-600 hover:bg-zinc-800";
}

function signUpButtonClasses(isActive: boolean) {
  return isActive
    ? "inline-flex min-h-11 items-center rounded-md border border-zinc-500 bg-zinc-800 px-3 py-1.5 font-medium text-zinc-100 whitespace-nowrap"
    : "inline-flex min-h-11 items-center rounded-md border border-zinc-600 bg-zinc-800 px-3 py-1.5 font-medium text-zinc-100 whitespace-nowrap hover:border-zinc-500 hover:bg-zinc-700";
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
    <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Homeschool Coding Club</p>
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-md border border-zinc-700 px-3 text-sm text-zinc-300 hover:bg-zinc-800 md:hidden"
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
          <Link href="/required-materials" className={getLinkClasses(pathname === "/required-materials")}>
            Required Materials
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/protected" className={getLinkClasses(pathname.startsWith("/protected"))}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex min-h-11 items-center rounded-md border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
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
            <Link href="/required-materials" className={getLinkClasses(pathname === "/required-materials")} onClick={closeMenu}>
              Required Materials
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/protected" className={getLinkClasses(pathname.startsWith("/protected"))} onClick={closeMenu}>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex min-h-11 items-center rounded-md border border-zinc-700 px-3 py-1.5 text-left text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800"
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
