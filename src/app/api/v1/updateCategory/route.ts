import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { requireRole } from "@/src/lib/roles";

export async function PUT(req: Request) {
    const auth = await requireRole(["Admin", "Manager"]);
    if (!auth.ok) return auth.response;
    const session = auth.session;
    try {
        const { feedbackId, category, sentiment, source } = await req.json();
        if (!feedbackId) {
            return NextResponse.json({ error: "feedbackId is required" }, { status: 400 });
        }
        const data: Record<string, string> = {};
        if (category) data.primary_category = category;
        if (sentiment) data.sentiment = sentiment;
        if (source !== undefined) data.source = source;

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }
        const feedback = await prisma.feedback.update({
            where: {
                id: feedbackId,
                organizationId: session.user.organizationId,
            },
            data,
        });
        return NextResponse.json({ message: "Feedback updated successfully", feedback }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
    }
}
