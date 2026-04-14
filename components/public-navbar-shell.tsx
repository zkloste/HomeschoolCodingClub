"use client";

import { usePathname } from "next/navigation";
import { SiteNavbar } from "@/components/site-navbar";

export function PublicNavbarShell() {
  const pathname = usePathname();

  if (pathname.startsWith("/protected")) {
    return null;
  }

  return <SiteNavbar />;
}
