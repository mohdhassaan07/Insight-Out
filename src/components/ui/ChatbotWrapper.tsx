"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Chatbot from "@/src/components/ui/Chatbot";

/**
 * Renders the chatbot only when the user is authenticated and on a /dashboard route.
 * Placed in the root layout so it persists across dashboard pages.
 */
export default function ChatbotWrapper() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Only show chatbot on dashboard routes for authenticated users
  if (status !== "authenticated" || !session || !pathname.startsWith("/dashboard")) {
    return null;
  }

  return <Chatbot />;
}
