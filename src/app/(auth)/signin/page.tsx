"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
      return;
    }

    if (res?.ok) {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 selection:bg-indigo-500/30 overflow-hidden font-sans transition-colors duration-500">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[20%] w-[70vw] h-[70vw] rounded-full bg-linear-to-b from-indigo-500/5 dark:from-indigo-500/10 to-purple-500/5 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[0%] -left-[20%] w-[50vw] h-[50vw] rounded-full bg-linear-to-tr from-zinc-200/50 dark:from-zinc-800/20 to-indigo-500/5 dark:to-indigo-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[60%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-purple-500/3 dark:bg-purple-500/5 blur-[80px]" />
      </div>

      {/* Subtle grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200/80 bg-white/70 text-stone-900 shadow-[0_10px_30px_-18px_rgba(67,56,202,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white transition-transform duration-500 group-hover:scale-110">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-serif italic tracking-tight text-stone-900 dark:text-stone-100">
              Insight-Out
            </span>
          </Link>
        </div>

        {/* Glass card */}
        <div className="relative rounded-3xl border border-zinc-200/70 dark:border-white/5 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl shadow-[0_30px_60px_-30px_rgba(67,56,202,0.15)] dark:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Card top accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-rrom-transparent via-indigo-500/30 to-transparent" />

          {/* Floating glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/15 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative p-10 sm:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 dark:text-zinc-500 mb-4 block">
                Welcome Back
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-zinc-900 dark:text-white mb-3">
                Sign in
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                Continue to your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="group">
                <label className="block text-[11px] font-mono tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400 mb-2.5">
                  Email Address
                </label>
                <div className={`relative rounded-xl border transition-all duration-500 ${focusedField === "email"
                  ? "border-indigo-500/50 dark:border-indigo-400/30 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                  : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/15"
                  }`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none font-light"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="group">
                <label className="block text-[11px] font-mono tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400 mb-2.5">
                  Password
                </label>
                <div className={`relative rounded-xl border transition-all duration-500 ${focusedField === "password"
                  ? "border-indigo-500/50 dark:border-indigo-400/30 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                  : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/15"
                  }`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none font-light"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-light">{error}</p>
                </div>
              )}

              {/* Remember & Forgot */}
              <div className="flex items-center justify-end">
                {/* <label className="flex items-center gap-2.5 cursor-pointer group/check">
                  <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500 bg-transparent" />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 group-hover/check:text-zinc-700 dark:group-hover/check:text-zinc-300 transition-colors">
                    Remember me
                  </span>
                </label> */}
                <Link
                  href="/forgot-password"
                  className="text-xs text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors duration-300"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit button */}
              <button
                id="signin-submit"
                type="submit"
                disabled={isLoading}
                className="group relative w-full px-6 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-medium tracking-wide overflow-hidden transition-all hover:scale-[1.01] duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200/70 dark:border-white/5" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm">
                  New here?
                </span>
              </div>
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-zinc-900 dark:text-zinc-100 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom accent text */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600">
            © 2026 Insight-Out. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}