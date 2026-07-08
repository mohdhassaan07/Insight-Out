import prisma from "@/src/lib/prisma";
import { isTeamManagedRole, requireRole } from "@/src/lib/roles";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateRoleSchema = z.object({
    role: z.enum(["Manager", "Member"]),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
    const auth = await requireRole(["Admin"]);
    if (!auth.ok) return auth.response;

    try {
        const { id } = await context.params;
        const parsed = updateRoleSchema.safeParse(await req.json());
        if (!parsed.success || !isTeamManagedRole(parsed.data.role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        if (id === auth.session.user.id) {
            return NextResponse.json({ error: "Use admin transfer to change the current admin" }, { status: 400 });
        }

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
            return NextResponse.json({ error: "Use admin transfer to change the current admin" }, { status: 400 });
        }

        const updatedMember = await prisma.user.update({
            where: { id },
            data: {
                role: parsed.data.role,
                sessionVersion: { increment: 1 },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profilePic: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ message: "Member role updated", member: updatedMember });
    } catch (error) {
        console.error("Update member role failed:", error);
        return NextResponse.json({ error: "Failed to update member role" }, { status: 500 });
    }
}
