import { embed, embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import prisma from "@/src/lib/prisma";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const embeddingModel = google.textEmbeddingModel("gemini-embedding-2-preview");
const EMBEDDING_DIMENSIONS = 768;

/**
 * Generate embedding for a single text.
 * Used for chat queries — embeds the user's question for similarity search.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType: "RETRIEVAL_QUERY",
      },
    },
  });
  return embedding;
}

/**
 * Generate and store embeddings for multiple feedbacks in batch.
 * Used at CSV import time — embeddings are generated once and stored alongside feedback.
 */
export async function generateAndStoreEmbeddings(
  feedbacks: { id: string; text: string }[]
): Promise<void> {
  if (feedbacks.length === 0) return;

  const BATCH_SIZE = 100;

  for (let i = 0; i < feedbacks.length; i += BATCH_SIZE) {
    const batch = feedbacks.slice(i, i + BATCH_SIZE);

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: batch.map((f) => f.text),
      providerOptions: {
        google: {
          outputDimensionality: EMBEDDING_DIMENSIONS,
          taskType: "RETRIEVAL_DOCUMENT",
        },
      },
    });

    // Store each embedding in PostgreSQL via raw SQL (pgvector)
    await Promise.all(
      batch.map((fb, idx) => {
        const vectorStr = `[${embeddings[idx].join(",")}]`;
        return prisma.$queryRawUnsafe(
          `UPDATE "Feedback" SET embedding = $1::vector WHERE id = $2::uuid`,
          vectorStr,
          fb.id
        );
      })
    );
  }
}
