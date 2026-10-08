import { generateText, stepCountIs } from "ai";
import { groq } from "@ai-sdk/groq";
import prisma from "@/src/lib/prisma";
import { createChatTools } from "@/src/lib/chat/tools";
import { formatResponse } from "@/src/lib/chat/responseGenerator";

/**
 * Chat response type shared across all paths.
 */
export interface ChatResponse {
  answer: string;
  queryType: "SQL" | "SEMANTIC" | "HYBRID";
  citations?: {
    count: number;
    entries: {
      id: string;
      text: string;
      category: string;
      sentiment: string;
    }[];
  };
  metadata?: {
    executionTimeMs: number;
  };
}

// ── SQL generation prompt ──────────────────────────────────────────────

const SQL_SYSTEM_PROMPT = `You are a SQL expert for a PostgreSQL database.

The database has a "Feedback" table with these columns:
- id (UUID, primary key)
- feedback_text (TEXT)
- primary_category (ENUM: 'Bug', 'Feature_Request', 'Performance', 'UI_UX', 'Positive_Feedback', 'Pricing', 'Support', 'Praise', 'Other')
- confidence (FLOAT, 0.0 to 1.0)
- sentiment (ENUM: 'Positive', 'Neutral', 'Negative')
- source (TEXT, nullable)
- status (ENUM: 'auto_approved', 'self_approved')
- "organizationId" (TEXT, foreign key)
- "createdAt" (TIMESTAMP WITH TIME ZONE)

Rules:
- Generate ONLY a single SELECT query.
- Do NOT include a WHERE clause for organizationId — it will be injected automatically.
- Use double quotes for camelCase column names: "createdAt", "organizationId".
- Use single quotes for string/enum values.
- Return ONLY the raw SQL query. No markdown, no explanation, no code fences.`;

// ── SQL validation (security layer) ────────────────────────────────────

const DANGEROUS_KEYWORDS =
  /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|EXEC|EXECUTE|CALL)\b/i;

const MULTI_STATEMENT = /;\s*\S/;
const SQL_COMMENT_LINE = /--/;
const SQL_COMMENT_BLOCK = /\/\*/;

/**
 * Validate and sanitize LLM-generated SQL.
 * Four layers of security:
 * 1. Read-only enforcement (block dangerous keywords)
 * 2. Injection prevention (block multi-statement, comments)
 * 3. Table whitelist (only "Feedback" table)
 * 4. Organization-level filter injection (server-side, never from LLM)
 * 5. Row limit enforcement
 */
function validateAndSanitizeSQL(
  sql: string,
  organizationId: string
): string {
  // Remove any markdown code fences the LLM might have included
  sql = sql.replace(/```sql\s*/gi, "").replace(/```\s*/g, "").trim();

  // 1. Read-only check
  if (DANGEROUS_KEYWORDS.test(sql)) {
    throw new Error("Only SELECT queries are allowed");
  }

  // Must start with SELECT
  if (!/^\s*SELECT\b/i.test(sql)) {
    throw new Error("Query must be a SELECT statement");
  }

  // 2. Injection prevention
  if (MULTI_STATEMENT.test(sql)) {
    throw new Error("Multiple SQL statements are not allowed");
  }
  if (SQL_COMMENT_LINE.test(sql) || SQL_COMMENT_BLOCK.test(sql)) {
    throw new Error("SQL comments are not allowed");
  }

  // 3. Table whitelist — only the Feedback table
  if (!/\bFROM\s+"?Feedback"?\b/i.test(sql)) {
    throw new Error("Query must target the Feedback table");
  }

  // 4. Inject organization filter (server-side, the LLM never provides this)
  sql = injectOrganizationFilter(sql, organizationId);

  // 5. Enforce LIMIT if not present
  if (!/LIMIT\s+\d+/i.test(sql)) {
    sql = sql.replace(/;?\s*$/, " LIMIT 100;");
  }

  return sql;
}

/**
 * Inject the organizationId filter into the SQL query.
 * This is always done server-side — the LLM cannot control which org's data it accesses.
 */
function injectOrganizationFilter(
  sql: string,
  organizationId: string
): string {
  const orgCondition = `"organizationId" = '${organizationId}'`;

  if (/\bWHERE\b/i.test(sql)) {
    // Insert org filter right after WHERE
    return sql.replace(/\bWHERE\b/i, `WHERE ${orgCondition} AND`);
  }

  // No WHERE clause — insert before GROUP BY, ORDER BY, LIMIT, HAVING, or end
  const insertionPoint =
    /\b(GROUP\s+BY|ORDER\s+BY|LIMIT|HAVING)\b/i;
  if (insertionPoint.test(sql)) {
    return sql.replace(insertionPoint, `WHERE ${orgCondition} $1`);
  }

  // No clauses after FROM — append WHERE at the end
  return sql.replace(/;?\s*$/, ` WHERE ${orgCondition};`);
}

// ── Tool-based path (primary for simple queries) ───────────────────────

/**
 * Try to answer the question using controlled tool functions first.
 * The LLM chooses which tool(s) to call, the AI SDK executes them.
 */
async function tryToolPath(
  userMessage: string,
  organizationId: string
): Promise<ChatResponse | null> {
  try {
    const tools = createChatTools(organizationId);

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are an AI assistant for a feedback analytics platform called Insight-Out.
Answer the user's question using the available tools. 
Use the tools to query the database, then provide a clear, data-driven answer.
Be concise. Use bullet points when appropriate. Include actual numbers.
Do NOT fabricate data — only use data returned by the tools.`,
      prompt: userMessage,
      tools,
      stopWhen: stepCountIs(3),
      temperature: 0,
    });

    // If the model successfully used tools and generated a response
    if (result.text && result.text.trim().length > 0) {
      return {
        answer: result.text,
        queryType: "SQL",
      };
    }

    return null;
  } catch {
    // If tool-based path fails, fall back to raw SQL generation
    return null;
  }
}

// ── Raw SQL path (fallback for complex queries) ────────────────────────

/**
 * Generate raw SQL for complex analytical queries that don't fit pre-defined tools.
 */
async function rawSQLPath(
  userMessage: string,
  organizationId: string
): Promise<ChatResponse> {
  // 1. LLM generates SQL
  const { text: rawSQL } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: SQL_SYSTEM_PROMPT,
    prompt: userMessage,
    temperature: 0,
  });

  // 2. Validate and sanitize
  const sanitizedSQL = validateAndSanitizeSQL(rawSQL, organizationId);

  // 3. Execute the query
  const results = await prisma.$queryRawUnsafe(sanitizedSQL);

  // 4. Format with LLM
  const answer = await formatResponse(
    userMessage,
    JSON.stringify(results, null, 2)
  );

  return { answer, queryType: "SQL" };
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Execute the SQL path for analytical/structured questions.
 * First tries controlled tool functions, falls back to raw SQL generation if needed.
 */
export async function executeSQLPath(
  userMessage: string,
  organizationId: string
): Promise<ChatResponse> {
  // Try tools first (safer, more controlled)
  const toolResult = await tryToolPath(userMessage, organizationId);
  if (toolResult) return toolResult;

  // Fallback to raw SQL generation
  return rawSQLPath(userMessage, organizationId);
}
