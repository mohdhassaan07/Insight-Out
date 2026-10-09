import "dotenv/config";
import { embedMany } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { PrismaClient } from "../src/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const embeddingModel = google.textEmbeddingModel("gemini-embedding-2-preview");
const EMBEDDING_DIMENSIONS = 768;

async function backfill() {
  const feedbacks: { id: string; feedback_text: string }[] =
    await prisma.$queryRawUnsafe(
      `SELECT id, feedback_text FROM "Feedback" WHERE embedding IS NULL`
    );

  console.log(`Found ${feedbacks.length} feedbacks without embeddings`);
  if (feedbacks.length === 0) {
    console.log("Nothing to backfill.");
    process.exit(0);
  }

  const BATCH_SIZE = 100;
  for (let i = 0; i < feedbacks.length; i += BATCH_SIZE) {
    const batch = feedbacks.slice(i, i + BATCH_SIZE);

    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: batch.map((f) => f.feedback_text),
      providerOptions: {
        google: {
          outputDimensionality: EMBEDDING_DIMENSIONS,
          taskType: "RETRIEVAL_DOCUMENT",
        },
      },
    });

    await Promise.all(
      batch.map((fb, idx) => {
        const vec = `[${embeddings[idx].join(",")}]`;
        return prisma.$queryRawUnsafe(
          `UPDATE "Feedback" SET embedding = $1::vector WHERE id = $2::uuid`,
          vec,
          fb.id
        );
      })
    );

    console.log(
      `Processed ${Math.min(i + BATCH_SIZE, feedbacks.length)}/${feedbacks.length}`
    );
  }

  console.log("Done!");
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
