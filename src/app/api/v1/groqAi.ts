import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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


export async function getGroqChatCompletion(feedbacks: string[]) {
  const prompt = buildPrompt(feedbacks);

  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}