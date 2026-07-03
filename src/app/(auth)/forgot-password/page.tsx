"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios, { AxiosError } from "axios";

const OTP_RESEND_SECONDS = 60;

type Step = "email" | "otp" | "reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(3);

  // OTP resend countdown timer
  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpResendTimer]);

  // Success auto-redirect countdown
  useEffect(() => {
    if (step !== "success") return;
    const interval = setInterval(() => {
      setSuccessCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Redirect when countdown reaches 0
  useEffect(() => {
    if (step === "success" && successCountdown === 0) {
      router.push("/signin");
    }
  }, [step, successCountdown, router]);

  const sendOtp = useCallback(async () => {
    try {
      setIsSendingOtp(true);
      setError(null);
      const response = await axios.post("/api/v1/forgot-password/send-otp", {
        email,
      });

      if (response.status === 200) {
        setOtpResendTimer(OTP_RESEND_SECONDS);
        return true;
      }
      return false;
    } catch (error) {
      const axiosError = error as AxiosError<{
        error?: string;
        retryAfter?: number;
      }>;
      const retryAfter = axiosError.response?.data?.retryAfter;

      if (typeof retryAfter === "number" && retryAfter > 0) {
        setOtpResendTimer(retryAfter);
      }

      setError(
        axiosError.response?.data?.error || "Failed to send OTP"
      );
      return false;
    } finally {
      setIsSendingOtp(false);
    }
  }, [email]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const success = await sendOtp();
    if (success) {
      setStep("otp");
    }
    setIsLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post("/api/v1/forgot-password/verify-otp", {
        email,
        otp,
      });
      if (res.status === 200) {
        setResetToken(res.data.resetToken);
        setStep("reset");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "/api/v1/forgot-password/reset-password",
        { email, resetToken, newPassword }
      );
      if (res.status === 200) {
        setStep("success");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      setError(
        axiosError.response?.data?.error || "Failed to reset password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const steps: { key: Step; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "otp", label: "Verify" },
    { key: "reset", label: "Reset" },
    { key: "success", label: "Done" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

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
            <div className="text-center mb-8">
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-500 dark:text-zinc-500 mb-4 block">
                Account Recovery
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-zinc-900 dark:text-white mb-3">
                {step === "email" && "Forgot password"}
                {step === "otp" && "Verify OTP"}
                {step === "reset" && "New password"}
                {step === "success" && "All done!"}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                {step === "email" && "Enter your email to receive a reset code"}
                {step === "otp" && `We sent a 6-digit code to ${email}`}
                {step === "reset" && "Choose a new password for your account"}
                {step === "success" && "Your password has been reset successfully"}
              </p>
            </div>

            {/* Step Progress Indicator */}
            <div className="flex items-center justify-center gap-1.5 mb-8">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1.5">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-mono font-semibold transition-all duration-500 ${i < currentStepIndex
                      ? "bg-indigo-500 text-white shadow-[0_0_12px_-2px_rgba(99,102,241,0.5)]"
                      : i === currentStepIndex
                        ? "bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 dark:border-indigo-400/30"
                        : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600 border border-zinc-200/50 dark:border-zinc-700/30"
                      }`}
                  >
                    {i < currentStepIndex ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-6 h-px transition-all duration-500 ${i < currentStepIndex
                        ? "bg-indigo-500"
                        : "bg-zinc-200 dark:bg-zinc-700/50"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Email */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
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
                      id="forgot-email"
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

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-light">{error}</p>
                  </div>
                )}

                <button
                  id="forgot-send-otp"
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
                        Sending code...
                      </>
                    ) : (
                      <>
                        Send Reset Code
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

            {/* Step 2: OTP */}
            {step === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="group">
                  <label className="block text-[11px] font-mono tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400 mb-2.5">
                    Verification Code
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-500 ${focusedField === "otp"
                    ? "border-indigo-500/50 dark:border-indigo-400/30 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                    : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/15"
                    }`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      id="forgot-otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      onFocus={() => setFocusedField("otp")}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none font-light tracking-[0.3em]"
                    />
                  </div>
                </div>

                {/* Resend OTP */}
                <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50/80 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-xs font-light">
                    {otpResendTimer > 0 ? `Resend in ${otpResendTimer}s` : "Didn't get the code?"}
                  </span>
                  <button
                    type="button"
                    disabled={otpResendTimer > 0 || isSendingOtp}
                    onClick={sendOtp}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    {isSendingOtp ? "Sending..." : "Resend"}
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-light">{error}</p>
                  </div>
                )}

                <button
                  id="forgot-verify-otp"
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
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Code
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

            {/* Step 3: New Password */}
            {step === "reset" && (
              <form onSubmit={handleResetSubmit} className="space-y-6">
                <div className="group">
                  <label className="block text-[11px] font-mono tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400 mb-2.5">
                    New Password
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-500 ${focusedField === "newPassword"
                    ? "border-indigo-500/50 dark:border-indigo-400/30 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                    : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/15"
                    }`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="forgot-new-password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setFocusedField("newPassword")}
                      onBlur={() => setFocusedField(null)}
                      required
                      minLength={8}
                      className="w-full pl-11 pr-4 py-3.5 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none font-light"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-600 font-light">
                    Minimum 8 characters
                  </p>
                </div>

                <div className="group">
                  <label className="block text-[11px] font-mono tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-400 mb-2.5">
                    Confirm Password
                  </label>
                  <div className={`relative rounded-xl border transition-all duration-500 ${focusedField === "confirmPassword"
                    ? "border-indigo-500/50 dark:border-indigo-400/30 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                    : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/15"
                    }`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      id="forgot-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      required
                      minLength={8}
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

                <button
                  id="forgot-reset-password"
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
                        Resetting password...
                      </>
                    ) : (
                      <>
                        Reset Password
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

            {/* Step 4: Success */}
            {step === "success" && (
              <div className="text-center space-y-6">
                {/* Success icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-400/15 flex items-center justify-center">
                      <svg className="w-8 h-8 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 blur-xl -z-10" />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                    Redirecting to sign in in{" "}
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{successCountdown}s</span>
                  </p>
                </div>

                <Link
                  href="/signin"
                  className="group relative inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-medium tracking-wide overflow-hidden transition-all hover:scale-[1.01] duration-300 text-sm"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Back to Sign In
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            )}

            {/* Back to Sign In link (shown on non-success steps) */}
            {step !== "success" && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200/70 dark:border-white/5" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm">
                      Remember it?
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                    Go back to{" "}
                    <Link
                      href="/signin"
                      className="text-zinc-900 dark:text-zinc-100 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
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
