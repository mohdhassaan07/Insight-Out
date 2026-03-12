"use client";

import { useState } from "react";
import Button from "./Button";
import axios from "axios";

export default function GenerateSummaryButton() {
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

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

    return (
        <>
            <Button onClick={handleGenerate} title="Generate summary for this month">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate Summary
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                AI-Generated Summary
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>                   

                        {error && (
                            <p className="text-red-500 text-sm py-2">{error}</p>
                        )}

                        <div className="prose rmv-scrollbar flex justify-center items-center prose-sm dark:prose-invert text-justify outline-2 outline-indigo-500 min-h-70 rounded-md p-4 dark:bg-zinc-900 mt-10  max-h-80 overflow-y-auto whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                            {isLoading && (
                            <div className="flex items-center justify-center py-12">
                                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span className="ml-3 text-zinc-500">Generating summary...</span>
                            </div>
                        )}
                            {summary}
                        </div>

                        {/* <div className="mt-4 flex justify-end">
                            <Button variant="ghost" onClick={() => setIsOpen(false)}>
                                Close
                            </Button>
                        </div> */}
                    </div>
                </div>
            )}
        </>
    );
}
