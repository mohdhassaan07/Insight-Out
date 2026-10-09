import { NextResponse } from "next/server";
import { requireSession } from "@/src/lib/roles";
import { chatLimiter } from "@/src/lib/rateLimiter";
import { routeQuery } from "@/src/lib/chat/router";
import { executeSQLPath } from "@/src/lib/chat/sqlPath";
import { executeSemanticPath } from "@/src/lib/chat/semanticPath";
import { executeHybridPath } from "@/src/lib/chat/hybridPath";

export async function POST(req: Request) {
  const startTime = Date.now();

  // 1. Auth
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  // 2. Rate limit
  const { success } = await chatLimiter.limit(auth.session.user.organizationId);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const organizationId = auth.session.user.organizationId;
    const trimmedMessage = message.trim();

    // 3. Route the query
    const route = await routeQuery(trimmedMessage);

    // 4. Execute the appropriate path
    let response;
    switch (route.type) {
      case "SQL":
        response = await executeSQLPath(trimmedMessage, organizationId);
        break;
      case "SEMANTIC":
        response = await executeSemanticPath(trimmedMessage, organizationId);
        break;
      case "HYBRID":
        response = await executeHybridPath(trimmedMessage, organizationId);
        break;
    }

    // 5. Add timing metadata
    response.metadata = { executionTimeMs: Date.now() - startTime };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process your question. Please try again." },
      { status: 500 }
    );
  }
}
