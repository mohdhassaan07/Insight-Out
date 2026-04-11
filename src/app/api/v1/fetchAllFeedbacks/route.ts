import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { apiLimiter } from "@/src/lib/rateLimiter";
import { authOptions } from "@/src/lib/auth";

export async function GET(req : Request){
    try {
        const session = await getServerSession(authOptions);
        const organizationId = session?.user.organizationId;
        if (!session || !organizationId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const key = session.user.organizationId;
        const { success } = await apiLimiter.limit(key);
        if (!success) {
            return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
        }
        const feedbacks = await prisma.feedback.findMany({
            where: { organizationId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
        return NextResponse.json({ feedbacks }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}