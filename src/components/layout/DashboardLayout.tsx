"use client";
import { SessionProvider } from "next-auth/react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Sidebar />
        <main className="ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
