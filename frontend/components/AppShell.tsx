"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isMarketingRoute = pathname.startsWith("/landing") || pathname === "/login";

  if (isMarketingRoute) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <AppHeader />
      <main className="mx-auto w-full max-w-[1600px] px-3 pt-20 md:px-5 md:pt-24">{children}</main>
    </div>
  );
}
