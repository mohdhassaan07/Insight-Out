import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { requireRole } from "@/src/lib/roles";

export async function PUT(req: Request) {
    const auth = await requireRole(["Admin", "Manager"]);
    if (!auth.ok) return auth.response;
    const session = auth.session;
    try {
        const { feedbackId } = await req.json();
        const feedback = await prisma.feedback.update({
            where: {
                id: feedbackId,
                organizationId: session?.user.organizationId
            },
            data: {
                status: "auto_approved"
            }
        })
        return NextResponse.json({ message: "Feedback approved successfully", feedback }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to approve feedback" }, { status: 500 });
    }

}