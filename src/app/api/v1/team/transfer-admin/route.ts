import prisma from "@/src/lib/prisma";
import { requireRole } from "@/src/lib/roles";
import { NextResponse } from "next/server";
import { z } from "zod";

const transferSchema = z.object({
    userId: z.string().min(1),
});

export async function POST(req: Request) {
    const auth = await requireRole(["Admin"]);
    if (!auth.ok) return auth.response;

    try {
        const parsed = transferSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "Target user is required" }, { status: 400 });
        }

        const targetUserId = parsed.data.userId;
        if (targetUserId === auth.session.user.id) {
            return NextResponse.json({ error: "You are already the admin" }, { status: 400 });
        }

        const target = await prisma.user.findFirst({
            where: {
                id: targetUserId,
                organizationId: auth.session.user.organizationId,
            },
            select: { id: true, role: true },
        });

        if (!target) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: auth.session.user.id },
                data: {
                    role: "Manager",
                    sessionVersion: { increment: 1 },
                },
            });

            await tx.user.update({
                where: { id: targetUserId },
                data: {
                    role: "Admin",
                    sessionVersion: { increment: 1 },
                },
            });
        });

        return NextResponse.json({ message: "Admin ownership transferred" });
    } catch (error) {
        console.error("Transfer admin failed:", error);
        return NextResponse.json({ error: "Failed to transfer admin ownership" }, { status: 500 });
    }
}
