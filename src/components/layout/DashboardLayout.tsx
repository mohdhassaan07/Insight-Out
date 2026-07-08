"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import SessionGuard from "@/src/components/providers/SessionGuard";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change on mobile.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSidebarOpen(false), 0);
    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SessionGuard />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile Header Bar */}
        <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl px-4 h-14 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-serif italic tracking-tight text-stone-900 dark:text-stone-100">
            Insight-Out
          </span>
        </div>

        <main className="lg:ml-64 min-h-screen">
          {children}
        </main>
      </div>
  );
}
