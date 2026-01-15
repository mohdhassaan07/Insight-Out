import { NextResponse } from "next/server";
import { Readable } from "stream";
import csv from "csv-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";


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
[
  { "feedback": "...", "category": "...", "confidence": 0.0, "sentiment": "..." },
]

Feedbacks:
${feedbacks.map((f, i) => `${i + 1}. ${f}`).join("\n")}
`;

}

function extractJSON(text: string) {
    // Remove ```json and ``` wrappers
    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function classifyWithGemini(feedbacks: string[]) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = buildPrompt(feedbacks);

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return extractJSON(text);
}

export async function POST(req: Request) {
    try {
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
                source: row.source
            }));

        const batches = arrayChunks(rows, 10);
        const finalResults: any = [];

        for (const batch of batches) {
            const texts = batch.map(b => b.feedback); // only text to AI
            const classified = await classifyWithGemini(texts);

            // merge AI result + source
            classified.forEach((ai: any, index: number) => {
                finalResults.push({
                    feedback_text: batch[index].feedback,
                    source: batch[index].source,
                    primary_category: ai.category,
                    confidence: ai.confidence,
                    sentiment: ai.sentiment,
                    status : ai.confidence <0.85 ? "self_approved" : "auto_approved"
                });
            });
        }
        console.log("Final Results:", finalResults);
        // Store results in the database
        const feedbackdata = await prisma.feedback.createMany({
            data: finalResults,
            skipDuplicates: true,
        })

        return NextResponse.json({ data: feedbackdata }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}