import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { generateEmbedding } from "@/src/lib/embeddings";
import { SEMANTIC_RESPONSE_PROMPT } from "@/src/lib/chat/responseGenerator";
import prisma from "@/src/lib/prisma";
import type { ChatResponse } from "@/src/lib/chat/sqlPath";
import type { ConversationMessage } from "@/src/lib/chat/history";

/**
 * Execute the semantic search path for meaning-based questions.
 *
 * Flow:
 * 1. Embed the user's question using text-embedding-004
 * 2. pgvector cosine similarity search against stored feedback embeddings
 * 3. LLM summarizes the relevant feedback with citations
 *
 * Accepts conversation history so the LLM summarizer can resolve follow-ups.
 */
export async function executeSemanticPath(
  userMessage: string,
  organizationId: string,
  history: ConversationMessage[] = []
): Promise<ChatResponse> {
  // 1. Embed the user's query
  const queryEmbedding = await generateEmbedding(userMessage);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  // 2. pgvector similarity search — org filter always enforced server-side
  const results: Array<{
    id: string;
    feedback_text: string;
    primary_category: string;
    sentiment: string;
    source: string | null;
    similarity: number;
  }> = await prisma.$queryRawUnsafe(
    `SELECT id, feedback_text, primary_category, sentiment, source,
            1 - (embedding <=> $1::vector) AS similarity
     FROM "Feedback"
     WHERE "organizationId" = $2
       AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT 15`,
    vectorStr,
    organizationId
  );

  if (results.length === 0) {
    return {
      answer:
        "I couldn't find any relevant feedback entries for your question. This might be because feedback embeddings haven't been generated yet.",
      queryType: "SEMANTIC",
    };
  }

  // 3. Build context from retrieved feedback
  const feedbackContext = results
    .map(
      (r, i) =>
        `${i + 1}. "${r.feedback_text}" [${r.sentiment}, ${r.primary_category}]`
    )
    .join("\n");

  // 4. Build prompt — prepend history so the LLM can handle follow-ups
  const historyText =
    history.length > 0
      ? history
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n") + "\n\n"
      : "";

  // 5. Summarize with citations using the LLM
  const { text: answer } = await generateText({
    model: groq("openai/gpt-oss-120b"),
    system: SEMANTIC_RESPONSE_PROMPT,
    prompt: `${historyText}User question: ${userMessage}\n\nRelevant feedback entries:\n${feedbackContext}`,
    temperature: 0.3,
  });

  return {
    answer,
    queryType: "SEMANTIC",
    citations: {
      count: results.length,
      entries: results.slice(0, 5).map((r) => ({
        id: r.id,
        text: r.feedback_text,
        category: r.primary_category,
        sentiment: r.sentiment,
      })),
    },
  };
}

