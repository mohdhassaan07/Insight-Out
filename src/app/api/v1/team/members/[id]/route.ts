import prisma from "@/src/lib/prisma";
import { requireRole } from "@/src/lib/roles";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
    const auth = await requireRole(["Admin"]);
    if (!auth.ok) return auth.response;

    try {
        const { id } = await context.params;
        const member = await prisma.user.findFirst({
            where: {
                id,
                organizationId: auth.session.user.organizationId,
            },
            select: { id: true, role: true },
        });

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }

        if (member.role === "Admin") {
            return NextResponse.json({ error: "Transfer admin ownership before removing this member" }, { status: 400 });
        }

        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ message: "Member removed" });
    } catch (error) {
        console.error("Remove member failed:", error);
        return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }
}
