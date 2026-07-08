import prisma from "@/src/lib/prisma";
import { buildInviteUrl, createInviteToken, getInviteExpiresAt, sendInviteEmail } from "@/src/lib/invites";
import { isTeamManagedRole, requireRole } from "@/src/lib/roles";
import { NextResponse } from "next/server";
import { z } from "zod";

const inviteSchema = z.object({
    email: z.string().email().max(100),
    role: z.enum(["Manager", "Member"]),
});

export async function POST(req: Request) {
    const auth = await requireRole(["Admin"]);
    if (!auth.ok) return auth.response;

    try {
        const parsed = inviteSchema.safeParse(await req.json());
        if (!parsed.success || !isTeamManagedRole(parsed.data.role)) {
            return NextResponse.json({ error: "Invalid invite data" }, { status: 400 });
        }

        const email = parsed.data.email.toLowerCase().trim();
        const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
        if (existingUser) {
            return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
        }

        await prisma.organizationInvite.updateMany({
            where: {
                organizationId: auth.session.user.organizationId,
                email,
                acceptedAt: null,
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });

        const { token, tokenHash } = createInviteToken();
        const inviteUrl = buildInviteUrl(req, token);
        const organizationName = auth.session.user.organizationName || "your organization";

        const invite = await prisma.organizationInvite.create({
            data: {
                organizationId: auth.session.user.organizationId,
                email,
                role: parsed.data.role,
                tokenHash,
                invitedByUserId: auth.session.user.id,
                expiresAt: getInviteExpiresAt(),
            },
            select: {
                id: true,
                email: true,
                role: true,
                expiresAt: true,
                createdAt: true,
            },
        });

        await sendInviteEmail({
            to: email,
            organizationName,
            inviterName: auth.session.user.name || "An admin",
            inviteUrl,
        });

        return NextResponse.json({ message: "Invite sent successfully", invite, inviteUrl }, { status: 201 });
    } catch (error) {
        console.error("Create invite failed:", error);
        return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
    }
}
