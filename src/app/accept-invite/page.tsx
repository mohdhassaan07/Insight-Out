"use client";

import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Invite token is missing.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("/api/v1/team/invites/accept", {
        token,
        name,
        password,
      });
      setMessage(response.data.message || "Invite accepted successfully.");
      setName("");
      setPassword("");
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || "Failed to accept invite.");
    } finally {
      setIsLoading(false);
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
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent" />

          {/* Floating glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/15 blur-[60px] rounded-full pointer-events-none" />

          <div className="relative p-10 sm:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              {/* Invite icon */}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-200/50 bg-indigo-50/80 dark:border-indigo-500/20 dark:bg-indigo-500/10 shadow-lg shadow-indigo-500/10">
                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 dark:text-zinc-500 mb-4 block">
                You&apos;re Invited
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-zinc-900 dark:text-white mb-3">
                Accept invite
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                Create your account to join the organization
              </p>
            </div>

            {message ? (
              /* Success state */
              <div className="text-center space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20">
                  <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{message}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">You can now sign in with your credentials</p>
                </div>
                <Link
                  href="/signin"
                  className="group relative inline-flex w-full items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-medium tracking-wide overflow-hidden transition-all hover:scale-[1.01] duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2 text-sm">
                    Go to Sign In
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name field */}
                <div className="group">
                  <label className="block text-[11px] font-mono tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400 mb-2.5">
                    Full Name
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-500 ${focusedField === "name"
                    ? "border-indigo-500/50 dark:border-indigo-400/30 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                    : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/15"
                    }`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="accept-invite-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none font-light rounded-xl"
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
                      id="accept-invite-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none font-light rounded-xl"
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

                {/* Submit button */}
                <button
                  id="accept-invite-submit"
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
                        Accepting...
                      </>
                    ) : (
                      <>
                        Accept Invite
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200/70 dark:border-white/5" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                Go back to{" "}
                <Link
                  href="/signin"
                  className="text-zinc-900 dark:text-zinc-100 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom accent text */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600">
            Secure invitation link
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteForm />
    </Suspense>
  );
}
