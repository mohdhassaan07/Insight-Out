"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Button from "@/src/components/ui/Button";
import Card, { CardContent } from "@/src/components/ui/Card";

export default function SignOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-zinc-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-linear-to-r from-indigo-400/20 to-purple-400/20 blur-3xl rounded-full" />
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Insight-Out
            </span>
          </Link>
        </div>

        <Card className="shadow-xl shadow-zinc-200/50 dark:shadow-none">
          <CardContent className="p-8">
            <div className="text-center">
              {/* Sign out icon */}
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Sign Out
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                Are you sure you want to sign out of your account?
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => signOut({ callbackUrl: "/signin" })}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}