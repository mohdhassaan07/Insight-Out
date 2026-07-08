import prisma from "@/src/lib/prisma";
import { requireRole } from "@/src/lib/roles";
import { NextResponse } from "next/server";

export async function GET() {
    const auth = await requireRole(["Admin", "Manager"]);
    if (!auth.ok) return auth.response;

    try {
        const [members, invites] = await Promise.all([
            prisma.user.findMany({
                where: { organizationId: auth.session.user.organizationId },
                orderBy: [{ role: "asc" }, { createdAt: "asc" }],
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    profilePic: true,
                    createdAt: true,
                },
            }),
            prisma.organizationInvite.findMany({
                where: {
                    organizationId: auth.session.user.organizationId,
                    acceptedAt: null,
                    revokedAt: null,
                    expiresAt: { gt: new Date() },
                },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    expiresAt: true,
                    createdAt: true,
                },
            }),
        ]);

        return NextResponse.json({ members, invites });
    } catch (error) {
        console.error("Fetch team failed:", error);
        return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
    }
}
