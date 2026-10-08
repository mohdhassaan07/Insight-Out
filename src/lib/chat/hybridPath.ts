import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { executeSQLPath } from "@/src/lib/chat/sqlPath";
import { executeSemanticPath } from "@/src/lib/chat/semanticPath";
import { HYBRID_RESPONSE_PROMPT } from "@/src/lib/chat/responseGenerator";
import type { ChatResponse } from "@/src/lib/chat/sqlPath";

/**
 * Execute the hybrid path — combines SQL (analytical) and semantic (meaning-based) retrieval.
 *
 * Flow:
 * 1. Run SQL path and semantic path in parallel
 * 2. Combine both results
 * 3. LLM generates a comprehensive answer with both quantitative and qualitative insights
 *
 * Example:
 *   "How many negative feedbacks are related to pricing, and what are users complaining about?"
 *   → SQL returns: count = 98
 *   → Semantic returns: relevant feedback texts about pricing complaints
 *   → Combined answer: "There are 98 negative pricing-related feedbacks. The main complaints are: ..."
 */
export async function executeHybridPath(
  userMessage: string,
  organizationId: string
): Promise<ChatResponse> {
  // Run both paths in parallel for speed
  const [sqlResult, semanticResult] = await Promise.all([
    executeSQLPath(userMessage, organizationId).catch((err) => ({
      answer: `Analytics data unavailable: ${err.message}`,
      queryType: "SQL" as const,
    })),
    executeSemanticPath(userMessage, organizationId).catch((err) => ({
      answer: `Semantic search unavailable: ${err.message}`,
      queryType: "SEMANTIC" as const,
    })),
  ]);

  // Combine both results into a single LLM call for a coherent response
  const { text: answer } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: HYBRID_RESPONSE_PROMPT,
    prompt: `User question: ${userMessage}

Analytics result:
${sqlResult.answer}

Relevant feedback analysis:
${semanticResult.answer}`,
    temperature: 0.3,
  });

  return {
    answer,
    queryType: "HYBRID",
    citations: "citations" in semanticResult ? semanticResult.citations : undefined,
  };
}
