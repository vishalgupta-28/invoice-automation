"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invoices", label: "Invoices" },
  { href: "/invoices/new", label: "New Invoice" },
  { href: "/clients", label: "Clients" }
];

export function AppHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith("/landing") || pathname === "/login") {
    return null;
  }

  return (
    <header
      className={`fixed z-40 transition-all duration-500 ${
        isScrolled ? "top-3 left-3 right-3 lg:left-4 lg:right-4" : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`relative mx-auto overflow-hidden transition-all duration-700 ${
          isScrolled || isMobileMenuOpen
            ? "max-w-[1220px] rounded-full border border-slate-300/60 bg-white/55 shadow-[0_16px_50px_rgba(15,23,42,0.18)] backdrop-blur-2xl"
            : "max-w-[1400px] bg-transparent"
        }`}
      >
        {isScrolled || isMobileMenuOpen ? (
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/70 via-white/40 to-transparent opacity-85" />
        ) : null}

        <div
          className={`relative z-10 flex items-center justify-between px-6 transition-all duration-700 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          <Link className="font-display text-2xl tracking-tight text-slate-900 transition-all duration-500" href="/dashboard">
            Invoice Automation
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {navItems.map((item) => (
              <Link
                className={cn(
                  "group relative text-sm text-slate-700 transition-colors duration-300 hover:text-slate-900",
                  pathname === item.href && "text-slate-950"
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-slate-900 transition-all duration-300",
                    pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                  )}
                />
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link className="text-sm text-slate-700 transition hover:text-slate-900" href="/login">
              Logout
            </Link>
            <Link className={buttonVariants({ variant: "default", size: "sm" })} href="/invoices/new">
              Create Invoice
            </Link>
          </div>

          <button
            aria-label="Toggle menu"
            className="p-2 text-slate-900 transition md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            type="button"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-30 bg-white transition-all duration-500 md:hidden ${
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col px-8 pb-8 pt-28">
          <div className="flex-1 space-y-6">
            {navItems.map((item, index) => (
              <Link
                className={`block text-4xl font-display text-slate-900 transition-all duration-500 ${
                  isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                href={item.href}
                key={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ transitionDelay: isMobileMenuOpen ? `${index * 70}ms` : "0ms" }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-4 border-t border-slate-300/70 pt-8">
            <Link
              className={cn(buttonVariants({ variant: "outline" }), "h-14 flex-1 rounded-full text-base")}
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Logout
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "default" }), "h-14 flex-1 rounded-full text-base")}
              href="/invoices/new"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Create Invoice
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
