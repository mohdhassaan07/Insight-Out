import { NextResponse } from "next/server";
import { Readable } from "stream";
import csv from "csv-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/src/lib/prisma";
import { v7 as uuidv7 } from "uuid";
import { authOptions } from "@/src/lib/auth"
import { getServerSession } from "next-auth";
import { uploadLimiter } from "@/src/lib/rateLimiter";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_FEEDBACKS_PER_UPLOAD = 100;

function buildPrompt(feedbacks: string[]) {
    const CATEGORIES = [
        "Bug",
        "Feature_Request",
        "Performance",
        "UI_UX",
        "Positive_Feedback",
        "Pricing",
        "Support",
        "Praise",
        "Other"
    ];

    return `
You are a product feedback classifier.

Classify each feedback into ONE category and assign sentiment (Positive, Neutral, Negative) from:
${CATEGORIES.join(", ")}

STRICT RULES:
- Category should be capitalized strictly the same as the CATEGORIES array
- Return ONLY valid JSON
- NO markdown
- NO explanations
- Confidence must vary per item
- confidence range: 0.0 to 1.0

Confidence meaning:
0.9–1.0 very clear
0.6–0.8 clear
0.3–0.5 ambiguous
0.0–0.2 unclear

Format:
{
  "feedbacks": [
    {
    "category": "...",
    "confidence": 0.0,
    "sentiment": "...",
    "keywords": ["short, specific product topic", "another relevant topic"]
    }
  ]
}

Keyword rules:
- Extract 1 to 3 of the most relevant product topics for each feedback.
- Use short, lowercase phrases (one to three words), such as "dark mode" or "slow loading".
- Do not include generic words such as "app", "feedback", "issue", "problem", "user", or sentiment words.
- Do not repeat a keyword within the same feedback.

Feedbacks:
${feedbacks.map((f, i) => `${i + 1}. ${f}`).join("\n")}
`;
}

function extractJSON(text: string): unknown[] {
    // Remove ```json and ``` wrappers
    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const parsed: unknown = JSON.parse(cleaned);

    if (
        typeof parsed !== "object" ||
        parsed === null ||
        !Array.isArray((parsed as { feedbacks?: unknown }).feedbacks)
    ) {
        throw new Error("AI returned an invalid classification response");
    }

    return (parsed as { feedbacks: unknown[] }).feedbacks;
}

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// async function classifyWithGemini(feedbacks: string[]) {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const prompt = buildPrompt(feedbacks);

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     return extractJSON(text);
// }

// using groqAi
function getGroqChatCompletion(feedbacks: string[]) {
    const prompt = buildPrompt(feedbacks);

    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        model: "openai/gpt-oss-20b",
        // JSON mode prevents unescaped quotes/newlines in model output from
        // breaking JSON.parse.
        response_format: { type: "json_object" },
    });
}

async function classifyWithGroq(feedbacks: string[]) {
    const response = await getGroqChatCompletion(feedbacks);
    const text = response.choices[0]?.message?.content ?? "{\"feedbacks\": []}";
    return extractJSON(text);
}

function preprocessFeedback(text: string): string {
    return text
        .replace(/http\S+/g, "")   // remove URLs
        .replace(/[^\w\s.,!?]/g, "") // remove emojis/special chars
        .trim()
        .slice(0, 500); // prevent token abuse
}

function arrayChunks<T>(arr: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

function normalizeKeyword(keyword: unknown): string | null {
    if (typeof keyword !== "string") return null;

    const normalized = keyword
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80);

    return normalized.length >= 2 ? normalized : null;
}

function countKeywords(classifiedFeedback: any[]): Map<string, number> {
    const keywordCounts = new Map<string, number>();

    for (const feedback of classifiedFeedback) {
        const keywords: unknown[] = Array.isArray(feedback.keywords) ? feedback.keywords : [];
        const uniqueKeywords = new Set(
            keywords
                .map(normalizeKeyword)
                .filter((keyword): keyword is string => keyword !== null)
        );

        // Count a keyword once per feedback, even if the AI repeats it in its response.
        for (const keyword of uniqueKeywords) {
            keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
        }
    }

    return keywordCounts;
}

export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
        const { success } = await uploadLimiter.limit(ip);
        if (!success) {
            return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const formData = await req.formData();
        const file = formData.get("file") as File || null;
        if (!file) {
            return NextResponse.json({
                error: "No file uploaded"
            },
                { status: 404 }
            )
        }
        if (file.type !== "text/csv") {
            return NextResponse.json(
                { error: "Only CSV files are allowed" },
                { status: 400 }
            )
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size must be 5 MB or less" },
                { status: 413 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const results: any[] = [];

        // Parse CSV through promise
        await new Promise<void>((resolve, reject) => {
            Readable.from(buffer)
                .pipe(csv())
                .on("data", (row) => {
                    results.push(row);
                })
                .on("end", () => resolve())
                .on("error", reject);
        });

        //preprocess and classify
        const rows = results
            .filter(
                (row) =>
                    typeof row.feedback === "string" &&
                    row.feedback.trim().length > 0
            )
            .map((row) => ({
                feedback: preprocessFeedback(row.feedback),
                source: row.source ? row.source : "unknown" // default source if not provided
            }));

        if (rows.length > MAX_FEEDBACKS_PER_UPLOAD) {
            return NextResponse.json(
                { error: `Maximum ${MAX_FEEDBACKS_PER_UPLOAD} feedbacks can be uploaded at once` },
                { status: 400 }
            );
        }

        const batches = arrayChunks(rows, 10);
        const finalResults: any[] = [];
        const classifiedFeedback: any[] = [];

        for (const batch of batches) {
            const texts = batch.map(b => b.feedback); // only text to AI
            const classified = await classifyWithGroq(texts);

            // merge AI result + source
            classified.forEach((ai: any, index: number) => {
                if (!batch[index]) return;

                classifiedFeedback.push(ai);
                finalResults.push({
                    id: uuidv7(),
                    feedback_text: batch[index].feedback,
                    source: batch[index].source,
                    primary_category: ai.category,
                    confidence: ai.confidence,
                    sentiment: ai.sentiment,
                    status: ai.confidence < 0.85 ? "self_approved" : "auto_approved",
                    organizationId: session?.user.organizationId
                });
            });
        }
        const keywordCounts = countKeywords(classifiedFeedback);

        // Store feedback, upload metadata, and keyword counts together.
        const feedbackdata = await prisma.$transaction(
            async (tx) => {
                const createdFeedback = await tx.feedback.createMany({
                    data: finalResults,
                    skipDuplicates: true,
                });

                await Promise.all([
                    tx.organization.update({
                        where: { id: session.user.organizationId },
                        data: { totalCSVUploads: { increment: 1 } }
                    }),
                    tx.csvUpload.create({
                        data: {
                            organizationId: session.user.organizationId,
                        }
                    }),
                    ...Array.from(keywordCounts, ([name, count]) =>
                        tx.keyword.upsert({
                            where: {
                                organizationId_name: {
                                    organizationId: session.user.organizationId,
                                    name,
                                },
                            },
                            create: {
                                name,
                                count,
                                organizationId: session.user.organizationId,
                            },
                            update: {
                                count: { increment: count },
                            },
                        })
                    ),
                ]);

                return createdFeedback;
            },
            {
                maxWait: 10000,
                timeout: 60000,
            }
        );
        return NextResponse.json({ data: feedbackdata, keywordsExtracted: keywordCounts.size }, { status: 200 });

    } catch (error: any) {
        console.error(error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
