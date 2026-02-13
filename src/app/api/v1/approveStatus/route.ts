import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth"
import { getServerSession } from "next-auth";
import prisma from "@/src/lib/prisma";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
        return NextResponse.json({ message: "Feedback approved successfully",feedback }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to approve feedback" }, { status: 500 });
    }

}