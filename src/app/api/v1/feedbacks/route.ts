import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth"
import { apiLimiter } from "@/src/lib/rateLimiter";
export const dynamic = "force-dynamic"; // Ensure this route is always dynamic and doesn't get statically optimized
export const revalidate = 0;


export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const key = session.user.organizationId;
        const { success } = await apiLimiter.limit(key);
        if (!success) {
            return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
        }
        const organizationId = session.user?.organizationId;
        if (!organizationId) {
            return NextResponse.json(
                { message: "Organization context is missing. Please sign in again." },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(req.url);
        const pageParam = Number(searchParams.get("page") ?? "1");
        const limitParam = Number(searchParams.get("limit") ?? "10");
        const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
        const requestedLimit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 10;
        const limit = Math.min(requestedLimit, 100);
        const skip = (page - 1) * limit;

        const where = { organizationId };

        const [feedbacks, total] = await Promise.all([
            prisma.feedback.findMany({
                where,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
    } catch (error: any) {
        console.error("GET /api/v1/feedbacks failed", error);
        if (error?.name === "JWTSessionError" || error?.name === "JWEInvalid") {
            return NextResponse.json({ message: "Invalid session. Please sign in again." }, { status: 401 });
        }
        return NextResponse.json({ message: "Failed to fetch feedbacks" }, { status: 500 });
    }

}