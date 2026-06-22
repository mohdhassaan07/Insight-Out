"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#CTA", label: "About" },
];

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setIsReady(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 16);

      if (currentScrollY < 16) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navClassName = [
    "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500",
    isReady
      ? isVisible
        ? "translate-y-0 opacity-100"
        : "-translate-y-full opacity-0"
      : "-translate-y-5 opacity-0",
    isScrolled
      ? "border-b border-stone-200/70 bg-white/72 py-3 shadow-[0_20px_50px_-35px_rgba(67,56,202,0.45)] backdrop-blur-2xl dark:border-stone-800/70 dark:bg-[#050505]/30"
      : "bg-transparent py-5",
  ].join(" ");

  return (
    <nav className={navClassName}>
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200/80 bg-white/70 text-stone-900 shadow-[0_10px_30px_-18px_rgba(67,56,202,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-serif italic tracking-tight text-stone-900 dark:text-stone-100">
            Insight-Out
          </span>
        </Link>

        <div className="hidden items-center justify-center gap-8 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-600 transition-colors hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}

        </div>

        <div className="hidden items-center justify-end gap-3 md:flex">
          {status === "loading" ? (
            <div className="h-11 w-32 animate-pulse rounded-full bg-stone-200/80 dark:bg-stone-800/70" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full border border-stone-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-stone-700 transition-all hover:border-stone-300 hover:text-stone-950 dark:border-white/10 dark:bg-white/5 dark:text-stone-200 dark:hover:border-white/20 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/signout"
                className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-600 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-white"
              >
                Sign Out
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="rounded-full px-4 py-2.5 text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 text-sm group relative bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full font-medium tracking-wide overflow-hidden transition-all hover:scale-[1.02] duration-300"
              >
                <span className="relative z-10">Get Started</span>
                <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-indigo-100 dark:to-purple-100" />
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="justify-self-end w-12 p-2.5 text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white md:hidden"
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div
        className={[
          "overflow-hidden border-stone-200/70 bg-white/95 backdrop-blur-2xl transition-all duration-300 dark:border-stone-800/70 dark:bg-[#090909]/92 md:hidden",
          isOpen ? "max-h-96 border-b opacity-100" : "max-h-0 border-b-0 opacity-0",
        ].join(" ")}
      >
        <div className="space-y-4 px-6 py-6">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block text-lg text-zinc-700 transition-colors hover:text-stone-950 dark:text-stone-300 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}

          {status === "loading" ? (
            <div className="h-12 w-full animate-pulse rounded-full bg-stone-200/80 dark:bg-stone-800/70" />
          ) : session ? (
            <div className="space-y-3">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block rounded-full border border-stone-200 bg-white px-5 py-3 text-center font-semibold text-stone-800 dark:border-white/10 dark:bg-white/5 dark:text-stone-100"
              >
                Dashboard
              </Link>
              <Link
                href="/signout"
                onClick={() => setIsOpen(false)}
                className="block rounded-full bg-stone-900 py-3 text-center font-semibold text-white dark:bg-stone-100 dark:text-stone-950"
              >
                Sign Out
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <Link
                href="/signin"
                onClick={() => setIsOpen(false)}
                className="block rounded-full border border-stone-200 bg-white px-5 py-3 text-center font-semibold text-zinc-800 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="block rounded-full bg-linear-to-r from-stone-900 via-indigo-700 to-stone-700 py-3 text-center font-semibold text-white dark:from-stone-100 dark:via-indigo-200 dark:to-stone-200 dark:text-stone-950"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
