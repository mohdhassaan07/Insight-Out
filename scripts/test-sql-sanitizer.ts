/**
 * Quick unit test for sqlPath sanitization logic.
 * Run with: npx tsx scripts/test-sql-sanitizer.ts
 */

const DANGEROUS_KEYWORDS =
  /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|EXEC|EXECUTE|CALL)\b/i;
const MULTI_STATEMENT = /;\s*\S/;
const SQL_COMMENT_LINE = /--/;
const SQL_COMMENT_BLOCK = /\/\*/;
const PARAMETER_PLACEHOLDER = /\$\d+/;

function stripTrailingSemicolon(sql: string): string {
  return sql.replace(/;?\s*$/, "");
}

function removeModelOrganizationFilter(sql: string): string {
  const orgPredicate =
    String.raw`\(?\s*"?organizationId"?\s*=\s*(?:'[^']*'|[^\s)]+)\s*\)?`;

  return sql
    .replace(new RegExp(String.raw`\s+WHERE\s+${orgPredicate}\s+AND\s+`, "i"), " WHERE ")
    .replace(new RegExp(String.raw`\s+WHERE\s+${orgPredicate}\s+(GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT)`, "i"), " $1")
    .replace(new RegExp(String.raw`\s+WHERE\s+${orgPredicate}\s*$`, "i"), "")
    .replace(new RegExp(String.raw`\s+AND\s+${orgPredicate}`, "i"), "")
    .replace(new RegExp(String.raw`\s+OR\s+${orgPredicate}`, "i"), "");
}

function injectOrganizationFilter(sql: string): string {
  const orgCondition = `"organizationId" = $1`;
  sql = stripTrailingSemicolon(sql);

  if (/\bWHERE\b/i.test(sql)) {
    return sql.replace(/\bWHERE\b/i, () => `WHERE ${orgCondition} AND`);
  }

  const insertionPoint = /\b(GROUP\s+BY|ORDER\s+BY|LIMIT|HAVING)\b/i;
  if (insertionPoint.test(sql)) {
    return sql.replace(insertionPoint, (clause) => `WHERE ${orgCondition} ${clause}`);
  }

  return `${sql} WHERE ${orgCondition}`;
}

function validateAndSanitizeSQL(sql: string): string {
  sql = sql.replace(/```sql\s*/gi, "").replace(/```\s*/g, "").trim();
  sql = stripTrailingSemicolon(sql);

  if (DANGEROUS_KEYWORDS.test(sql)) throw new Error("Only SELECT queries are allowed");
  if (!/^\s*SELECT\b/i.test(sql)) throw new Error("Query must be a SELECT statement");
  if (MULTI_STATEMENT.test(sql)) throw new Error("Multiple SQL statements are not allowed");
  if (SQL_COMMENT_LINE.test(sql) || SQL_COMMENT_BLOCK.test(sql)) throw new Error("SQL comments are not allowed");
  if (PARAMETER_PLACEHOLDER.test(sql)) throw new Error("SQL parameter placeholders are not allowed");

  sql = removeModelOrganizationFilter(sql);

  if (!(/\bFROM\s+"Feedback"/i.test(sql) || /\bFROM\s+[Ff]eedback\b/i.test(sql))) {
    throw new Error("Query must target the Feedback table");
  }
  sql = sql.replace(/\bFROM\s+(?:"Feedback"|[Ff]eedback\b)/g, `FROM "Feedback"`);
  sql = injectOrganizationFilter(sql);

  if (!/LIMIT\s+\d+/i.test(sql)) {
    sql = `${stripTrailingSemicolon(sql)} LIMIT 100`;
  }

  return sql;
}

// ── Test cases ──────────────────────────────────────────────────────────

type TestCase = {
  name: string;
  input: string;
  expectedContains?: string[];
  expectedError?: string;
};

const cases: TestCase[] = [
  {
    name: "Simple COUNT(*)",
    input: `SELECT COUNT(*) FROM "Feedback"`,
    expectedContains: [`FROM "Feedback"`, `"organizationId" = $1`, "LIMIT 100"],
  },
  {
    name: "Unquoted lowercase table",
    input: `SELECT COUNT(*) FROM feedback`,
    expectedContains: [`FROM "Feedback"`, `"organizationId" = $1`],
  },
  {
    name: "With GROUP BY",
    input: `SELECT primary_category, COUNT(*) FROM "Feedback" GROUP BY primary_category ORDER BY COUNT(*) DESC LIMIT 1`,
    expectedContains: [`WHERE "organizationId" = $1 GROUP BY`, "LIMIT 1"],
  },
  {
    name: "With ORDER BY only",
    input: `SELECT * FROM "Feedback" ORDER BY "createdAt" DESC LIMIT 10`,
    expectedContains: [`WHERE "organizationId" = $1 ORDER BY`],
  },
  {
    name: "No GROUP/ORDER/LIMIT",
    input: `SELECT id, feedback_text FROM "Feedback"`,
    expectedContains: [`WHERE "organizationId" = $1`, "LIMIT 100"],
  },
  {
    name: "LLM hallucinated WHERE with org filter + AND",
    input: `SELECT * FROM "Feedback" WHERE "organizationId" = 'some-id' AND sentiment = 'Positive' GROUP BY primary_category`,
    expectedContains: [`WHERE "organizationId" = $1 AND sentiment = 'Positive'`],
  },
  {
    name: "LLM hallucinated WHERE with org filter only",
    input: `SELECT COUNT(*) FROM "Feedback" WHERE "organizationId" = 'abc-123'`,
    expectedContains: [`FROM "Feedback"`, `WHERE "organizationId" = $1`],
  },
  {
    name: "LLM hallucinated WHERE org filter before GROUP BY",
    input: `SELECT primary_category FROM "Feedback" WHERE "organizationId" = 'abc' GROUP BY primary_category`,
    expectedContains: [`WHERE "organizationId" = $1 GROUP BY primary_category`],
  },
  {
    name: "With existing WHERE + AND sentinel",
    input: `SELECT * FROM "Feedback" WHERE sentiment = 'Negative'`,
    expectedContains: [`WHERE "organizationId" = $1 AND sentiment = 'Negative'`],
  },
  {
    name: "Markdown code fence",
    input: "```sql\nSELECT COUNT(*) FROM \"Feedback\"\n```",
    expectedContains: [`FROM "Feedback"`, `"organizationId" = $1`],
  },
  {
    name: "DANGEROUS: DELETE",
    input: `DELETE FROM "Feedback"`,
    expectedError: "Only SELECT queries are allowed",
  },
  {
    name: "DANGEROUS: parameter placeholder from LLM",
    input: `SELECT * FROM "Feedback" WHERE "organizationId" = $1`,
    expectedError: "SQL parameter placeholders are not allowed",
  },
  {
    name: "DANGEROUS: SQL comment",
    input: `SELECT * FROM "Feedback" -- inject`,
    expectedError: "SQL comments are not allowed",
  },
  {
    name: "DANGEROUS: multi-statement (SELECT;SELECT)",
    input: `SELECT * FROM "Feedback"; SELECT 1`,
    expectedError: "Multiple SQL statements are not allowed",
  },
];

let passed = 0;
let failed = 0;

for (const tc of cases) {
  try {
    const result = validateAndSanitizeSQL(tc.input);

    if (tc.expectedError) {
      console.error(`❌ FAIL [${tc.name}]: expected error "${tc.expectedError}" but got result: ${result}`);
      failed++;
      continue;
    }

    const misses = (tc.expectedContains ?? []).filter((s) => !result.includes(s));
    if (misses.length > 0) {
      console.error(`❌ FAIL [${tc.name}]`);
      console.error(`   output  : ${result}`);
      console.error(`   missing : ${misses.join(" | ")}`);
      failed++;
    } else {
      console.log(`✅ PASS [${tc.name}]`);
      console.log(`   → ${result}`);
      passed++;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (tc.expectedError && msg.includes(tc.expectedError)) {
      console.log(`✅ PASS [${tc.name}] (correctly threw: ${msg})`);
      passed++;
    } else if (tc.expectedError) {
      console.error(`❌ FAIL [${tc.name}]: expected error "${tc.expectedError}" but got: ${msg}`);
      failed++;
    } else {
      console.error(`❌ FAIL [${tc.name}]: unexpected error: ${msg}`);
      console.error(`   input: ${tc.input}`);
      failed++;
    }
  }
}

console.log(`\n── Results: ${passed} passed, ${failed} failed ──`);
if (failed > 0) process.exit(1);
