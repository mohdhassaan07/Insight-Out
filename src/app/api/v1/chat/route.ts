import { NextResponse } from "next/server";
import { requireSession } from "@/src/lib/roles";
import { chatLimiter } from "@/src/lib/rateLimiter";
import { routeQuery } from "@/src/lib/chat/router";
import { executeSQLPath } from "@/src/lib/chat/sqlPath";
import { executeSemanticPath } from "@/src/lib/chat/semanticPath";
import { executeHybridPath } from "@/src/lib/chat/hybridPath";
import {
  verifyChatOwnership,
  createChat,
  loadHistory,
  saveMessages,
} from "@/src/lib/chat/history";

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
    const { message, chatId: incomingChatId } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const userId = auth.session.user.id;
    const organizationId = auth.session.user.organizationId;
    const trimmedMessage = message.trim();

    // 3. Resolve chat session — create new or verify ownership of existing
    let chatId: string;
    if (incomingChatId) {
      try {
        // Ensures the authenticated user actually owns this chat
        chatId = await verifyChatOwnership(incomingChatId, userId, organizationId);
      } catch {
        return NextResponse.json(
          { error: "Chat not found or access denied" },
          { status: 403 }
        );
      }
    } else {
      // First message — create a new chat session
      chatId = await createChat(userId, organizationId, trimmedMessage);
    }

    // 4. Load previous messages from PostgreSQL (latest 20, oldest→newest)
    const history = await loadHistory(chatId);

    // 5. Route the query — history lets the router classify follow-up questions
    const route = await routeQuery(trimmedMessage, history);

    // 6. Execute the appropriate path, passing history for context
    let response;
    switch (route.type) {
      case "SQL":
        response = await executeSQLPath(trimmedMessage, organizationId, history);
        break;
      case "SEMANTIC":
        response = await executeSemanticPath(trimmedMessage, organizationId, history);
        break;
      case "HYBRID":
        response = await executeHybridPath(trimmedMessage, organizationId, history);
        break;
    }

    // 7. Persist user message + assistant reply atomically once response is ready
    await saveMessages(chatId, trimmedMessage, response.answer);

    // 8. Return response — include chatId so client can continue the conversation
    response.metadata = { executionTimeMs: Date.now() - startTime };
    return NextResponse.json({ ...response, chatId });

  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process your question. Please try again." },
      { status: 500 }
    );
  }
}
