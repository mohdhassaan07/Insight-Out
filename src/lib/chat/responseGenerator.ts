import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

/**
 * System prompt for converting raw data into natural language responses.
 * Used by all three paths (SQL, Semantic, Hybrid).
 */
const RESPONSE_SYSTEM_PROMPT = `You are an AI assistant for Insight-Out, a feedback analytics platform.
Convert the provided data into a clear, helpful answer for the user.

Rules:
- Be concise and data-driven.
- Use bullet points when listing multiple items.
- Include actual numbers from the data.
- Do NOT invent or extrapolate beyond the provided data.
- If data is empty or insufficient, say so honestly.
- Keep responses focused and actionable.`;

/**
 * System prompt for semantic/meaning-based responses.
 * Instructs the LLM to cite specific feedback entries.
 */
export const SEMANTIC_RESPONSE_PROMPT = `You are an AI assistant for Insight-Out, a feedback analytics platform.
Summarize the relevant feedback entries to answer the user's question.

Rules:
- Only use information from the provided feedback entries.
- Be concise and insightful. Use bullet points for main themes.
- After your summary, include a "Based on X relevant feedback entries:" section
  with 3-5 direct quotes from the most relevant entries.
- Do NOT fabricate feedback or statistics.
- If the retrieved entries don't seem relevant to the question, say so honestly.`;

/**
 * System prompt for hybrid responses (SQL + semantic combined).
 */
export const HYBRID_RESPONSE_PROMPT = `You are an AI assistant for Insight-Out, a feedback analytics platform.
You have both quantitative data and relevant feedback text. Combine them into a comprehensive answer.

Rules:
- Start with the quantitative insight (counts, percentages).
- Then provide qualitative themes from the feedback text.
- Use bullet points for clarity.
- After your analysis, include a "Based on relevant feedback entries:" section
  with 3-5 direct quotes from the most relevant entries.
- Do NOT fabricate data or feedback.
- Include actual numbers from the analytics data.`;

/**
 * Format raw data into a natural language response using the LLM.
 * This is the final step — raw database results are never returned directly to the user.
 */
export async function formatResponse(
  userMessage: string,
  data: string,
  systemPrompt: string = RESPONSE_SYSTEM_PROMPT
): Promise<string> {
  const { text } = await generateText({
    model: groq("openai/gpt-oss-120b"),
    system: systemPrompt,
    prompt: `User question: ${userMessage}\n\nData:\n${data}`,
    temperature: 0.3,
  });

  return text;
}
