"use client";
import { useState, useEffect } from "react";
import Button from "./Button";
import axios from "axios";
import { usefeedbackStore } from "@/src/store/feedbackStore";

export default function GenerateSummaryButton() {
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const { allFeedbacks, fetchAllFeedbacks } = usefeedbackStore();

    useEffect(() => {
        fetchAllFeedbacks();
    }, [summary])

    function thisMonthFeedbackCount() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const thismonth = allFeedbacks.filter((feedback) => {
            const createdAt = new Date(feedback.createdAt);
            return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        })
        return thismonth.length;
    }

    // Handle open/close animation
    useEffect(() => {
        if (isOpen) {
            // Small delay for mount animation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            });
        }
    }, [isOpen]);

    function handleClose() {
        setIsVisible(false);
        setTimeout(() => setIsOpen(false), 300);
    }

    async function handleGenerate() {
        setIsLoading(true);
        setError(null);
        setSummary(null);
        setIsOpen(true);

        try {
            const res = await axios("/api/v1/generate-summary");
            if (!res.data || !res.data.summary) {
                throw new Error("Failed to generate summary");
            }
            const data = await res.data;
            setSummary(data.summary);
        } catch {
            setError("Failed to generate summary. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCopy() {
        if (!summary) return;
        try {
            await navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
        }
    }

    function handleRetry() {
        handleGenerate();
    }

    const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const feedbackCount = thisMonthFeedbackCount();

    return (
        <>
            <Button onClick={handleGenerate} variant="outline" title="Generate summary for this month">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate Summary
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
                        onClick={handleClose}
                    />

                    {/* Slide-over Panel */}
                    <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                        <div
                            className={`w-screen max-w-lg transform transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}
                        >
                            <div className="flex h-full flex-col bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl">

                                {/* Panel Header */}
                                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Animated AI Icon */}
                                            <div className="relative">
                                                <div className="p-2 bg-linear-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-xl">
                                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24">
                                                        <path
                                                            stroke="currentColor"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                                                        />
                                                    </svg>
                                                </div>
                                                {isLoading && (
                                                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                                                    AI Summary
                                                </h2>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                    {currentMonth} · {feedbackCount} feedback{feedbackCount !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleClose}
                                            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Status Indicator Bar */}
                                {isLoading && (
                                    <div className="h-0.5 w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                        <div className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-shimmer"
                                            style={{ width: "40%" }}
                                        />
                                    </div>
                                )}

                                {/* Panel Body */}
                                <div className="flex-1 overflow-y-auto rmv-scrollbar">
                                    {/* Error State */}
                                    {error && (
                                        <div className="m-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                                            <div className="flex items-start gap-3">
                                                <div className="p-1 mt-0.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                                        Generation Failed
                                                    </p>
                                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                        {error}
                                                    </p>
                                                    <button
                                                        onClick={handleRetry}
                                                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        Try again
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Loading Skeleton */}
                                    {isLoading && !summary && (
                                        <div className="p-6 space-y-6">
                                            {/* Skeleton header */}
                                            <div className="space-y-3">
                                                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-2/3 animate-pulse" />
                                                <div className="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg w-1/3 animate-pulse" style={{ animationDelay: "0.1s" }} />
                                            </div>
                                            {/* Skeleton paragraphs */}
                                            <div className="space-y-2.5">
                                                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse" style={{ animationDelay: "0.15s" }} />
                                                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                                                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-11/12 animate-pulse" style={{ animationDelay: "0.25s" }} />
                                                <div className="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg w-4/5 animate-pulse" style={{ animationDelay: "0.3s" }} />
                                            </div>
                                            <div className="space-y-2.5">
                                                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse" style={{ animationDelay: "0.35s" }} />
                                                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                                                <div className="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg w-3/4 animate-pulse" style={{ animationDelay: "0.45s" }} />
                                            </div>
                                            <div className="space-y-2.5">
                                                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full animate-pulse" style={{ animationDelay: "0.5s" }} />
                                                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-10/12 animate-pulse" style={{ animationDelay: "0.55s" }} />
                                                <div className="h-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg w-2/3 animate-pulse" style={{ animationDelay: "0.6s" }} />
                                            </div>
                                            {/* Animated text */}
                                            <div className="flex items-center justify-center gap-2 pt-4">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    AI is analyzing your feedback...
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary Content */}
                                    {summary && (
                                        <div className="p-6">
                                            {/* Generated badge */}
                                            <div className="flex items-center gap-2 mb-5">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Generated
                                                </span>
                                                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                    {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                            </div>

                                            {/* Summary text */}
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                                    {summary}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty state when no loading and no summary */}
                                    {!isLoading && !summary && !error && (
                                        <div className="flex flex-col items-center justify-center h-full py-20 px-6">
                                            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-4">
                                                <svg className="w-8 h-8 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24">
                                                    <path
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                No summary generated yet
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center max-w-[240px]">
                                                Click the button below to generate an AI-powered summary of this month&apos;s feedback.
                                            </p>
                                            <button
                                                onClick={handleGenerate}
                                                className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/25"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <path
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                                                    />
                                                </svg>
                                                Generate Summary
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Panel Footer - Actions */}
                                {summary && (
                                    <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                        <div className="flex items-center justify-between">
                                            <button
                                                onClick={handleGenerate}
                                                disabled={isLoading}
                                                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 disabled:opacity-50"
                                            >
                                                <svg className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Regenerate
                                            </button>
                                            <button
                                                onClick={handleCopy}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200"
                                            >
                                                {copied ? (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        Copy Summary
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
