import prisma from "@/src/lib/prisma";
import { hashInviteToken } from "@/src/lib/invites";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const acceptInviteSchema = z.object({
    token: z.string().min(20),
    name: z.string().min(3).max(100).regex(/^[a-zA-Z\s]+$/),
    password: z.string().min(3).max(30),
});

export async function POST(req: Request) {
    try {
        const parsed = acceptInviteSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid invite acceptance data" }, { status: 400 });
        }

        const tokenHash = hashInviteToken(parsed.data.token);
        const invite = await prisma.organizationInvite.findUnique({
            where: { tokenHash },
            include: { organization: { select: { name: true } } },
        });

        if (!invite || invite.acceptedAt || invite.revokedAt || invite.expiresAt <= new Date()) {
            return NextResponse.json({ error: "Invite is invalid or expired" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: invite.email },
            select: { id: true },
        });

        if (existingUser) {
            return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

        const user = await prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    name: parsed.data.name,
                    email: invite.email,
                    password: hashedPassword,
                    role: invite.role,
                    organizationId: invite.organizationId,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    organizationId: true,
                    profilePic: true,
                    createdAt: true,
                },
            });

            await tx.organizationInvite.update({
                where: { id: invite.id },
                data: { acceptedAt: new Date() },
            });

            return createdUser;
        });

        return NextResponse.json({
            message: "Invite accepted successfully",
            user,
            organizationName: invite.organization.name,
        }, { status: 201 });
    } catch (error) {
        console.error("Accept invite failed:", error);
        return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
    }
}
