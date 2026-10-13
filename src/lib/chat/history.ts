import prisma from "@/src/lib/prisma";

/** Maximum number of past messages to load per request. */
const HISTORY_LIMIT = 20;

/** A single chat turn as sent to the LLM. */
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Verify that a chat belongs to the requesting user AND organization.
 * Returns the chat id if valid, throws if not found / unauthorized.
 */
export async function verifyChatOwnership(
  chatId: string,
  userId: string,
  organizationId: string
): Promise<string> {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId, organizationId },
    select: { id: true },
  });

  if (!chat) {
    throw new Error("Chat not found or access denied");
  }

  return chat.id;
}

/**
 * Create a new chat session in the database.
 * The title is derived from the first user message (truncated to 80 chars).
 */
export async function createChat(
  userId: string,
  organizationId: string,
  firstMessage: string
): Promise<string> {
  const title =
    firstMessage.length > 80
      ? firstMessage.slice(0, 77) + "…"
      : firstMessage;

  const chat = await prisma.chat.create({
    data: { userId, organizationId, title },
    select: { id: true },
  });

  return chat.id;
}

/**
 * Load the most recent N messages for a chat, ordered oldest → newest,
 * ready to be sent directly to the LLM as conversation history.
 *
 * Only the last HISTORY_LIMIT messages are fetched to stay within
 * model context / cost limits. Increase or decrease as needed.
 */
export async function loadHistory(
  chatId: string
): Promise<ConversationMessage[]> {
  // Fetch the latest messages (DESC) then reverse so they are oldest→newest
  const rows = await prisma.chatMessage.findMany({
    where: { chatId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
    select: { sender: true, message: true },
  });

  return rows
    .reverse()
    .map((r) => ({
      role: r.sender === "user" ? "user" : "assistant",
      content: r.message,
    }));
}

/**
 * Persist a user message and an assistant reply together in a single
 * Prisma transaction so the history is always consistent.
 */
export async function saveMessages(
  chatId: string,
  userMessage: string,
  assistantReply: string
): Promise<void> {
  await prisma.$transaction([
    prisma.chatMessage.create({
      data: { chatId, sender: "user", message: userMessage },
    }),
    prisma.chatMessage.create({
      data: { chatId, sender: "assistant", message: assistantReply },
    }),
  ]);
}
