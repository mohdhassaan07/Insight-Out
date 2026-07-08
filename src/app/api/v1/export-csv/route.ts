import { NextResponse } from "next/server";
import { Parser } from "json2csv";
import prisma from "@/src/lib/prisma";
import { exportLimiter } from "@/src/lib/rateLimiter";
import { requireRole } from "@/src/lib/roles";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const auth = await requireRole(["Admin", "Manager"]);
        if (!auth.ok) return auth.response;
        const session = auth.session;

        const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
        const { success } = await exportLimiter.limit(ip);
        if (!success) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        const feedbacks = await prisma.feedback.findMany({
            where: {
                organizationId: session.user.organizationId
            },
            select: {
                feedback_text: true,
                primary_category: true,
                sentiment: true,
                status: true,
                source: true,
                createdAt: true
            }
        });

        // convert to csv
        const parser = new Parser({
            fields: [
                "feedback_text",
                "primary_category",
                "sentiment",
                "status",
                "source",
                "createdAt"
            ]
        });
        const csv = parser.parse(feedbacks);
        const date = new Date().toISOString().split("T")[0];
        return new Response(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition":
                    `attachment; filename="feedbacks-${date}.csv"`
            }
        });
    } catch (error) {
        console.error("Error exporting CSV:", error);
        return NextResponse.json({ error: "Failed to export CSV" },
            { status: 500 })
    }

}
