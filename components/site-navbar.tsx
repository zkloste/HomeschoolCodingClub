"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function getLinkClasses(isActive: boolean) {
  if (isActive) {
    return "rounded-md border border-indigo-300/70 bg-indigo-500/25 px-3 py-1.5 text-white";
  }

  return "rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10";
}

export function SiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    router.push("/auth/login");
    router.refresh();
  };

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
          {isAuthenticated ? (
            <>
              <Link href="/protected" className={getLinkClasses(pathname.startsWith("/protected"))}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
