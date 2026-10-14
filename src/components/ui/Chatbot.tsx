"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore, ChatMessage } from "@/src/store/chatStore";

/* ── Suggested questions ────────────────────────────────────────────── */
const SUGGESTED_QUESTIONS = [
  "How many total feedbacks?",
  "What's the sentiment breakdown?",
  "What are users saying about pricing?",
  "How many negative feedbacks are related to pricing, and what are users complaining about?"
];

/* ── Markdown-lite renderer (bold, bullets, code) ───────────────────── */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    // Bold
    let processed: React.ReactNode = line;
    const boldParts = line.split(/\*\*(.*?)\*\*/g);
    if (boldParts.length > 1) {
      processed = boldParts.map((part, j) =>
        j % 2 === 1 ? (
          <strong key={j} className="font-semibold">
            {part}
          </strong>
        ) : (
          part
        )
      );
    }

    // Bullet point
    if (line.match(/^[\s]*[-•*]\s/)) {
      const content = line.replace(/^[\s]*[-•*]\s/, "");
      const bulletParts = content.split(/\*\*(.*?)\*\*/g);
      const bulletContent =
        bulletParts.length > 1
          ? bulletParts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold">
                {part}
              </strong>
            ) : (
              part
            )
          )
          : content;
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="text-indigo-600 dark:text-indigo-400 mt-1.5 shrink-0 text-[8px]">●</span>
          <span>{bulletContent}</span>
        </div>
      );
      return;
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, "");
      const numMatch = line.match(/^(\d+)\./);
      const num = numMatch ? numMatch[1] : "";
      const numParts = content.split(/\*\*(.*?)\*\*/g);
      const numContent =
        numParts.length > 1
          ? numParts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold">
                {part}
              </strong>
            ) : (
              part
            )
          )
          : content;
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="text-indigo-600 dark:text-indigo-400 font-medium shrink-0 text-xs mt-0.5">
            {num}.
          </span>
          <span>{numContent}</span>
        </div>
      );
      return;
    }

    // Inline code
    if (typeof processed === "string" && processed.includes("`")) {
      const codeParts = processed.split(/`(.*?)`/g);
      if (codeParts.length > 1) {
        processed = codeParts.map((part, j) =>
          j % 2 === 1 ? (
            <code
              key={j}
              className="bg-indigo-100 dark:bg-zinc-700/50 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-700 dark:text-indigo-300"
            >
              {part}
            </code>
          ) : (
            part
          )
        );
      }
    }

    // Empty line → spacer
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    elements.push(
      <p key={i} className="leading-relaxed">
        {processed}
      </p>
    );
  });

  return elements;
}

/* ── Sentiment color badge ──────────────────────────────────────────── */
function sentimentColor(s: string) {
  switch (s) {
    case "Positive":
      return "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30";
    case "Negative":
      return "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30";
    default:
      return "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30";
  }
}

/* ── Query type badge ───────────────────────────────────────────────── */
function QueryTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    SQL: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/25",
    SEMANTIC: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/25",
    HYBRID: "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/25",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${colors[type] || ""}`}
    >
      {type === "SQL" && (
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      )}
      {type === "SEMANTIC" && (
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )}
      {type === "HYBRID" && (
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )}
      {type}
    </span>
  );
}

/* ── Citation accordion ─────────────────────────────────────────────── */
function Citations({
  citations,
}: {
  citations: ChatMessage["citations"];
}) {
  const [open, setOpen] = useState(false);
  if (!citations || citations.entries.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors group"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>
          {citations.count} source{citations.count > 1 ? "s" : ""} referenced
        </span>
      </button>

      {open && (
        <div className="mt-2 space-y-2 chatbot-citations-enter">
          {citations.entries.map((entry, i) => (
            <div
              key={entry.id || i}
              className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 text-xs"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${sentimentColor(entry.sentiment)}`}
                >
                  {entry.sentiment}
                </span>
                <span className="text-zinc-500 dark:text-zinc-500 text-[10px]">{entry.category.replace("_", " ")}</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                &ldquo;{entry.text}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Typing indicator ───────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 chatbot-msg-enter">
      <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-1.5">
          <span className="chatbot-typing-dot w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" style={{ animationDelay: "0ms" }} />
          <span className="chatbot-typing-dot w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" style={{ animationDelay: "150ms" }} />
          <span className="chatbot-typing-dot w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

/* ── Single message bubble ──────────────────────────────────────────── */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end chatbot-msg-enter">
        <div className="max-w-[85%] bg-linear-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-tr-md px-4 py-2.5 shadow-lg shadow-indigo-500/10">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 chatbot-msg-enter">
      <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="max-w-[85%] space-y-1">
        <div className="bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl rounded-tl-md px-4 py-3 text-sm text-zinc-700 dark:text-zinc-200 shadow-sm dark:shadow-none">
          {renderMarkdown(message.content)}
        </div>

        {/* Metadata row */}
        {/* <div className="flex items-center gap-2 px-1">
          {message.queryType && <QueryTypeBadge type={message.queryType} />}
          {message.executionTimeMs && (
            <span className="text-[10px] text-zinc-500">
              {(message.executionTimeMs / 1000).toFixed(1)}s
            </span>
          )}
        </div> */}

        {/* Citations */}
        <Citations citations={message.citations} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN CHATBOT COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function Chatbot() {
  const {
    messages,
    isOpen,
    isLoading,
    error,
    toggleChat,
    closeChat,
    sendMessage,
    clearMessages,
  } = useChatStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeChat();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, closeChat]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;
      setInput("");
      sendMessage(trimmed);
    },
    [input, isLoading, sendMessage]
  );

  const handleSuggestion = useCallback(
    (q: string) => {
      if (isLoading) return;
      setInput("");
      sendMessage(q);
    },
    [isLoading, sendMessage]
  );

  return (
    <>
      {/* ── Floating Action Button ──────────────────────────────────── */}
      <button
        id="chatbot-fab"
        onClick={toggleChat}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          bg-linear-to-r from-indigo-600 to-purple-600
          text-white shadow-xl shadow-indigo-500/30
          flex items-center justify-center
          hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105
          active:scale-95
          transition-all duration-300 ease-out
          chatbot-fab-pulse
          ${isOpen ? "chatbot-fab-open" : ""}
        `}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Chat icon → Close icon transition */}
        <div className="relative w-6 h-6">
          <svg
            className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <svg
            className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </button>

      {/* ── Chat Panel ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          ref={chatPanelRef}
          className="
            fixed bottom-24 right-6 z-50
            w-95 max-w-[calc(100vw-2rem)]
            h-140 max-h-[calc(100vh-8rem)]
            flex flex-col
            bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl
            border border-zinc-200 dark:border-zinc-700/50
            rounded-2xl
            shadow-2xl shadow-zinc-300/40 dark:shadow-black/40
            chatbot-panel-enter
            overflow-hidden
          "
        >
          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="relative px-5 py-4 border-b border-zinc-200 dark:border-zinc-800/80 shrink-0">
            {/* Gradient line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 chatbot-gradient-line" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Insight AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 chatbot-status-pulse" />
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Ready to help</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear chat */}
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Clear chat"
                    title="Clear chat"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                {/* Close */}
                <button
                  onClick={closeChat}
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Close chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Messages ────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 chatbot-scrollbar">
            {/* Welcome state */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 chatbot-msg-enter">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Ask about your feedback
                </h4>
                <p className="text-xs text-zinc-500 mb-5 max-w-60">
                  Get instant insights from your feedback data using natural language queries.
                </p>

                <div className="w-full space-y-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSuggestion(q)}
                      className="
                        w-full text-left px-3.5 py-2.5 rounded-xl
                        bg-zinc-50 border border-zinc-200
                        dark:bg-zinc-800/60 dark:border-zinc-700/40
                        text-xs text-zinc-600 dark:text-zinc-300
                        hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700
                        dark:hover:bg-zinc-800 dark:hover:border-indigo-500/30 dark:hover:text-indigo-300
                        transition-all duration-200
                        group
                      "
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {q}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Loading state */}
            {isLoading && <TypingIndicator />}

            {/* Error state */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 chatbot-msg-enter">
                <svg className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ───────────────────────────────────────────────── */}
          <div className="px-4 pb-4 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLoading ? "Thinking..." : "Ask about your feedback..."}
                  disabled={isLoading}
                  className="
                    w-full px-4 py-2.5 rounded-xl
                    bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50
                    text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500
                    focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-400/30 dark:focus:ring-indigo-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="
                  p-2.5 rounded-xl
                  bg-linear-to-r from-indigo-600 to-purple-600
                  text-white
                  hover:from-indigo-500 hover:to-purple-500
                  disabled:opacity-30 disabled:cursor-not-allowed
                  transition-all duration-200
                  shadow-lg shadow-indigo-500/20
                  hover:shadow-indigo-500/30
                  active:scale-95
                "
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </form>

            <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-600 mt-2">
              Powered by AI · Responses based on your data
            </p>
          </div>
        </div>
      )}
    </>
  );
}
