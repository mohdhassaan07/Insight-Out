import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  queryType?: "SQL" | "SEMANTIC" | "HYBRID";
  citations?: {
    count: number;
    entries: {
      id: string;
      text: string;
      category: string;
      sentiment: string;
    }[];
  };
  executionTimeMs?: number;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  error: null,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  sendMessage: async (content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Request failed with status ${res.status}`
        );
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        queryType: data.queryType,
        citations: data.citations,
        executionTimeMs: data.metadata?.executionTimeMs,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      set({ isLoading: false, error: message });
    }
  },

  clearMessages: () => set({ messages: [], error: null }),
}));
