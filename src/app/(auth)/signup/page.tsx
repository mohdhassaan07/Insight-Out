"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [orgName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, orgName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      router.push("/signin?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  const fields = [
    {
      id: "signup-name",
      label: "Full Name",
      type: "text",
      placeholder: "John Doe",
      value: name,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
      fieldKey: "name",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: "signup-org",
      label: "Organization",
      type: "text",
      placeholder: "Acme Inc.",
      value: orgName,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setOrganizationName(e.target.value),
      fieldKey: "org",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: "signup-email",
      label: "Email Address",
      type: "email",
      placeholder: "you@example.com",
      value: email,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
      fieldKey: "email",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      ),
    },
    {
      id: "signup-password",
      label: "Password",
      type: "password",
      placeholder: "••••••••",
      value: password,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
      fieldKey: "password",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: "signup-confirm",
      label: "Confirm Password",
      type: "password",
      placeholder: "••••••••",
      value: confirmPassword,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value),
      fieldKey: "confirm",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 selection:bg-indigo-500/30 overflow-hidden font-sans transition-colors duration-500 px-4 py-12">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-linear-to-brom-indigo-500/5 dark:from-indigo-500/10 to-purple-500/5 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[0%] -right-[20%] w-[50vw] h-[50vw] rounded-full bg-linear-to-trrom-zinc-200/50 dark:from-zinc-800/20 to-indigo-500/5 dark:to-indigo-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[40%] left-[60%] w-[25vw] h-[25vw] rounded-full bg-purple-500/3 dark:bg-purple-500/5 blur-[80px]" />
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
            <div className="text-center mb-8">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 dark:text-zinc-500 mb-4 block">
                Get Started
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-zinc-900 dark:text-white mb-3">
                Create account
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                Start categorizing your feedback today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map((field) => (
                <div key={field.fieldKey} className="group">
                  <label className="block text-[11px] font-mono tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400 mb-2.5">
                    {field.label}
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-500 ${focusedField === field.fieldKey
                    ? "border-indigo-500/50 dark:border-indigo-400/30 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                    : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/15"
                    }`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                      {field.icon}
                    </div>
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={field.value}
                      onChange={field.onChange}
                      onFocus={() => setFocusedField(field.fieldKey)}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none font-light"
                    />
                  </div>
                </div>
              ))}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-light">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-2">
                <button
                  id="signup-submit"
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
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </form>

            {/* Terms */}
            <p className="mt-6 text-[11px] text-center text-zinc-400 dark:text-zinc-500 font-light leading-relaxed">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                Privacy Policy
              </Link>
            </p>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200/70 dark:border-white/5" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm">
                  Already a member?
                </span>
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-zinc-900 dark:text-zinc-100 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
                >
                  Sign in
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
