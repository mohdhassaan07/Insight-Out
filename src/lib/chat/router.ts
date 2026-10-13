import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import type { ConversationMessage } from "@/src/lib/chat/history";

/**
 * Zod schema for the query router output.
 * The AI SDK's structured output guarantees the LLM output matches this schema.
 */
const RouterSchema = z.object({
  type: z.enum(["SQL", "SEMANTIC", "HYBRID"]),
});

export type RouteType = z.infer<typeof RouterSchema>;

const ROUTER_SYSTEM_PROMPT = `You are a query classifier for a feedback analytics platform.

Classify the user's question into exactly one type:

SQL — The question asks for counts, percentages, rankings, comparisons, 
      or any quantitative answer that can be computed from structured columns:
      primary_category (Bug, Feature_Request, Performance, UI_UX, Positive_Feedback, Pricing, Support, Praise, Other),
      sentiment (Positive, Neutral, Negative),
      source, createdAt.
      Examples: "How many feedbacks?", "Which category has the most?", "What percentage is negative?"
      
SEMANTIC — The question asks about the meaning, content, or themes within 
           feedback text. It wants to understand what users are saying or feeling.
           Examples: "What are users saying about pricing?", "Show me complaints about login."
           
HYBRID — The question asks for BOTH a quantitative answer AND qualitative 
         insight from feedback text in the same question.
         Examples: "How many negative pricing complaints, and what are they about?"

Classify accurately. When in doubt between SQL and HYBRID, prefer SQL.
When in doubt between SEMANTIC and HYBRID, prefer SEMANTIC.`;

/**
 * Build a compact history string for the router prompt so it can classify
 * follow-up questions that rely on prior context (e.g. "tell me more").
 */
function buildHistoryContext(history: ConversationMessage[]): string {
  if (history.length === 0) return "";
  const lines = history
    .slice(-6) // Only need the last 3 turns for routing context
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
  return `\n\nConversation so far:\n${lines}\n\nNew question to classify:`;
}

/**
 * Route a user's chat message to the appropriate processing path.
 * Uses Groq LLM with structured output via Zod schema validation.
 * Accepts optional conversation history to correctly classify follow-ups.
 */
export async function routeQuery(
  userMessage: string,
  history: ConversationMessage[] = []
): Promise<RouteType> {
  const historyContext = buildHistoryContext(history);

  const { output } = await generateText({
    model: groq("openai/gpt-oss-120b"),
    output: Output.object({ schema: RouterSchema }),
    system: ROUTER_SYSTEM_PROMPT,
    prompt: `${historyContext} ${userMessage}`.trim(),
    temperature: 0,
  });

  return output;
}

