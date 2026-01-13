import { NextResponse } from "next/server";
import { Readable } from "stream";
import csv from "csv-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

function buildPrompt(feedbacks: any[]) {
    const CATEGORIES = [
        "Bug",
        "Feature Request",
        "Performance Issue",
        "UI/UX Issue",
        "Positive Feedback",
        "Other"
    ];

    return `
You are a product feedback classifier.

Classify each feedback into ONE category from:
${CATEGORIES.join(", ")}

Return JSON array only.
Format:
[
  { "feedback": "...", "category": "...", "confidence": 0.0 }
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

async function classifyWithGemini(feedbacks: any[]) {
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

        await new Promise<void>((resolve, reject) => {
            Readable.from(buffer)
                .pipe(csv())
                .on("data", (row) => {
                    results.push(row);
                })
                .on("end", () => resolve())
                .on("error", reject);
        });

        const processed = results
            .map(row => row.feedback)
            .filter(f => typeof f === "string" && f.trim().length > 0)
            .map(f => preprocessFeedback(f));

        const batches = arrayChunks(processed, 10);
        const finalResults: any = [];
        for (const batch of batches) {
            console.log(batch)
            const classified = await classifyWithGemini(batch);
            finalResults.push(...classified);
        }

        return NextResponse.json({ data: finalResults }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}