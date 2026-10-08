import { tool } from "ai";
import { z } from "zod";
import prisma from "@/src/lib/prisma";
import { generateEmbedding } from "@/src/lib/embeddings";

const CATEGORIES = [
  "Bug",
  "Feature_Request",
  "Performance",
  "UI_UX",
  "Positive_Feedback",
  "Pricing",
  "Support",
  "Praise",
  "Other",
] as const;

const SENTIMENTS = ["Positive", "Neutral", "Negative"] as const;

/**
 * Resolve a human-readable time period to a Prisma date filter.
 */
function resolveTimeRange(period: string): { gte?: Date; lt?: Date } {
  const now = new Date();

  switch (period) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { gte: start };
    }
    case "this_week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const start = new Date(now.getFullYear(), now.getMonth(), diff);
      return { gte: start };
    }
    case "this_month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { gte: start };
    }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      return { gte: start, lt: end };
    }
    default:
      return {};
  }
}

/**
 * Create chat tools scoped to a specific organization.
 * These are controlled database functions that the LLM can call via the AI SDK's tool() API.
 * The organization filter is always enforced server-side — the LLM cannot bypass it.
 */
export function createChatTools(organizationId: string) {
  return {
    getFeedbackCount: tool({
      description:
        "Get the total count of feedbacks, optionally filtered by sentiment and/or category",
      inputSchema: z.object({
        sentiment: z
          .enum(SENTIMENTS)
          .optional()
          .describe("Filter by sentiment"),
        category: z
          .enum(CATEGORIES)
          .optional()
          .describe("Filter by category"),
      }),
      execute: async ({ sentiment, category }) => {
        const where: Record<string, unknown> = { organizationId };
        if (sentiment) where.sentiment = sentiment;
        if (category) where.primary_category = category;

        const count = await prisma.feedback.count({ where });
        return { count };
      },
    }),

    getCategoryStats: tool({
      description:
        "Get feedback count grouped by category, optionally filtered by sentiment. Returns categories sorted by count descending.",
      inputSchema: z.object({
        sentiment: z
          .enum(SENTIMENTS)
          .optional()
          .describe("Filter by sentiment"),
      }),
      execute: async ({ sentiment }) => {
        const where: Record<string, unknown> = { organizationId };
        if (sentiment) where.sentiment = sentiment;

        const stats = await prisma.feedback.groupBy({
          where,
          by: ["primary_category"],
          _count: true,
          orderBy: { _count: { id: "desc" } },
        });

        return stats.map((s) => ({
          category: s.primary_category,
          count: s._count,
        }));
      },
    }),

    getSentimentStats: tool({
      description:
        "Get feedback count grouped by sentiment, with percentages. Optionally filter by category.",
      inputSchema: z.object({
        category: z
          .enum(CATEGORIES)
          .optional()
          .describe("Filter by category"),
      }),
      execute: async ({ category }) => {
        const where: Record<string, unknown> = { organizationId };
        if (category) where.primary_category = category;

        const [stats, total] = await Promise.all([
          prisma.feedback.groupBy({
            where,
            by: ["sentiment"],
            _count: true,
          }),
          prisma.feedback.count({ where }),
        ]);

        return stats.map((s) => ({
          sentiment: s.sentiment,
          count: s._count,
          percentage: total > 0 ? Math.round((s._count / total) * 100) : 0,
        }));
      },
    }),

    getFeedbackByDateRange: tool({
      description:
        "Get feedback count for a specific time period: today, this_week, this_month, or last_month. Optionally filter by sentiment and/or category.",
      inputSchema: z.object({
        period: z.enum(["today", "this_week", "this_month", "last_month"]),
        sentiment: z
          .enum(SENTIMENTS)
          .optional()
          .describe("Filter by sentiment"),
        category: z
          .enum(CATEGORIES)
          .optional()
          .describe("Filter by category"),
      }),
      execute: async ({ period, sentiment, category }) => {
        const dateRange = resolveTimeRange(period);
        const where: Record<string, unknown> = {
          organizationId,
          createdAt: dateRange,
        };
        if (sentiment) where.sentiment = sentiment;
        if (category) where.primary_category = category;

        const count = await prisma.feedback.count({ where });
        return { count, period };
      },
    }),

    searchFeedback: tool({
      description:
        "Search feedback by text content using semantic similarity (vector search). Use this for meaning-based queries like 'what are users saying about X'. Returns the most relevant feedback entries.",
      inputSchema: z.object({
        searchQuery: z
          .string()
          .describe("The search query to find relevant feedback"),
        sentiment: z
          .enum(SENTIMENTS)
          .optional()
          .describe("Filter by sentiment"),
        category: z
          .enum(CATEGORIES)
          .optional()
          .describe("Filter by category"),
        limit: z
          .number()
          .max(20)
          .default(10)
          .describe("Number of results to return (max 20)"),
      }),
      execute: async ({ searchQuery, sentiment, category, limit }) => {
        const queryEmbedding = await generateEmbedding(searchQuery);
        const vectorStr = `[${queryEmbedding.join(",")}]`;

        // Build filter conditions — org filter is always enforced server-side
        const conditions: string[] = [
          `"organizationId" = $2`,
          `embedding IS NOT NULL`,
        ];
        if (sentiment) conditions.push(`sentiment = '${sentiment}'`);
        if (category) conditions.push(`primary_category = '${category}'`);

        const whereClause = conditions.join(" AND ");

        const results: Array<{
          id: string;
          feedback_text: string;
          primary_category: string;
          sentiment: string;
          similarity: number;
        }> = await prisma.$queryRawUnsafe(
          `SELECT id, feedback_text, primary_category, sentiment,
                  1 - (embedding <=> $1::vector) AS similarity
           FROM "Feedback"
           WHERE ${whereClause}
           ORDER BY embedding <=> $1::vector
           LIMIT ${limit}`,
          vectorStr,
          organizationId
        );

        return results.map((r) => ({
          id: r.id,
          text: r.feedback_text,
          category: r.primary_category,
          sentiment: r.sentiment,
          similarity: Number(r.similarity),
        }));
      },
    }),
  };
}
