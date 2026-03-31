import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    console.log("organization :", session?.user.organizationId);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
        const skip = (page - 1) * limit;

        const where = { organizationId: session.user.organizationId };

        const [feedbacks, total] = await prisma.$transaction([
            prisma.feedback.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.feedback.count({ where }),
        ]);
        const loaded = skip + feedbacks.length;
        const hasMore = loaded < total;

        return NextResponse.json(
            {
                feedbacks,
                page,
                limit,
                total,
                hasMore,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch feedbacks" }, { status: 500 });
    }

}