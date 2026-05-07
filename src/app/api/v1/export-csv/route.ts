import { authOptions } from "@/src/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Parser } from "json2csv";
import prisma from "@/src/lib/prisma";
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.organizationId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
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