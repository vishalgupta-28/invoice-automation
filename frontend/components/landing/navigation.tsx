"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Moon, Sun, X } from "lucide-react";

const navLinks = [
  { name: "Capabilities", href: "#features", external: false },
  { name: "Process", href: "#how-it-works", external: false },
  { name: "GitHub", href: "https://github.com/vishalgupta-28", external: true },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/vishal-gupta-9baaa1265/", external: true },
  { name: "Portfolio", href: "https://portfolio-nu-plum-19.vercel.app/", external: true }
];

interface NavigationProps {
  isColorMode: boolean;
  onToggleTheme: () => void;
}

export function Navigation({ isColorMode, onToggleTheme }: NavigationProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToLogin = () => {
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled 
          ? "top-3 left-3 right-3 lg:left-4 lg:right-4" 
          : "top-0 left-0 right-0"
      }`}
    >
      <nav 
        className={`relative mx-auto overflow-hidden transition-all duration-700 ${
          isScrolled || isMobileMenuOpen
            ? "max-w-[1220px] rounded-full border border-white/20 bg-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        {isScrolled || isMobileMenuOpen ? (
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-white/10 to-transparent opacity-70" />
        ) : null}
        <div 
          className={`relative z-10 flex items-center justify-between transition-all duration-700 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <Link href="/landing" className="flex items-center group">
            <span className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl text-foreground" : "text-2xl text-white"}`}>Invoice Automation</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                rel={link.external ? "noopener noreferrer" : undefined}
                target={link.external ? "_blank" : undefined}
                className={`text-sm transition-colors duration-300 relative group ${isScrolled ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white"}`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${isScrolled ? "bg-foreground" : "bg-white"}`} />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              aria-label={isColorMode ? "Switch to dark mode" : "Switch to color mode"}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-500 ${
                isScrolled
                  ? "border-foreground/20 bg-background/70 text-foreground hover:bg-background"
                  : "border-white/35 bg-black/30 text-white hover:bg-black/45"
              }`}
              onClick={onToggleTheme}
              type="button"
            >
              {isColorMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <Link href="/login" className={`transition-all duration-500 ${isScrolled ? "text-xs text-foreground/70 hover:text-foreground" : "text-sm text-white/70 hover:text-white"}`}>
              Sign in
            </Link>
            <Button
              size="sm"
              className={`rounded-full transition-all duration-500 ${isScrolled ? "bg-foreground hover:bg-foreground/90 text-background px-4 h-8 text-xs" : "bg-white hover:bg-white/90 text-black px-6"}`}
              onClick={goToLogin}
            >
              Sign up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              aria-label={isColorMode ? "Switch to dark mode" : "Switch to color mode"}
              className={`p-2 transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"}`}
              onClick={onToggleTheme}
              type="button"
            >
              {isColorMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

      </nav>
      
      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${
          isMobileMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                rel={link.external ? "noopener noreferrer" : undefined}
                target={link.external ? "_blank" : undefined}
                className={`text-5xl font-display text-foreground hover:text-muted-foreground transition-all duration-500 ${
                  isMobileMenuOpen 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>
          
          {/* Bottom CTAs */}
          <div className={`flex gap-4 pt-8 border-t border-foreground/10 transition-all duration-500 ${
            isMobileMenuOpen 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <Button 
              variant="outline" 
              className="flex-1 rounded-full h-14 text-base"
              onClick={goToLogin}
            >
              Sign in
            </Button>
            <Button 
              className="flex-1 bg-foreground text-background rounded-full h-14 text-base"
              onClick={goToLogin}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
