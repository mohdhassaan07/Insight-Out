import { authOptions } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

function buildPrompt(feedbacks: string[]) {
    return `You are an AI assistant that analyzes customer feedback.

Your task is to generate a concise analytics summary of the feedback dataset.

Rules:
- Write a clear and professional summary.
- Focus on insights, not individual feedback.
- Identify common issues, positive points, and trends.
- Keep the summary between 80–120 words.
- Use bullet points.
- Do not repeat the same idea.
- Do not mention individual users.
- Only use information present in the feedback data.

Provide insights in the following format:
• Overall sentiment trend
• Most common positive feedback
• Most common complaints
• Key categories mentioned
• Any noticeable pattern or trend

Feedback Data:
${feedbacks.map((f, i) => `${i + 1}. ${f}`).join("\n")}
`
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateSummarywithAI(feedbacks: string[]) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = buildPrompt(feedbacks);
    const result = await model.generateContent(prompt);
    return result.response.text();
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    try {
        let month = new Date().getMonth()+1;
        const feedbacks = await prisma.feedback.findMany({
            where:{
                organizationId: session?.user?.organizationId!,
                createdAt: {
                    gte: new Date(new Date().getFullYear(), month-1, 1),
                    lt: new Date(new Date().getFullYear(), month, 1)
                }
            }
        })
        const feedbackTexts = feedbacks.map(f => f.feedback_text);
        const summary = await generateSummarywithAI(feedbackTexts);
        return NextResponse.json({ summary });
    } catch (error) {
        return NextResponse.json({ error: "An error occurred while processing the request" }, { status: 500 });
    }
}