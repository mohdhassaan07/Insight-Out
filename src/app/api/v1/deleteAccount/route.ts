import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { verifyOtp } from "@/src/lib/otp";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const email = session?.user?.email;

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { otp } = body;

        if (!otp) {
            return NextResponse.json({ error: "OTP is required" }, { status: 400 });
        }

        const verification = await verifyOtp(email, otp);
        if (!verification.ok) {
            return NextResponse.json({ error: verification.message }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, organizationId: true, role: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.role === "Admin") {
            await prisma.$transaction([
                prisma.organizationInvite.deleteMany({ where: { organizationId: user.organizationId } }),
                prisma.feedback.deleteMany({ where: { organizationId: user.organizationId } }),
                prisma.csvUpload.deleteMany({ where: { organizationId: user.organizationId } }),
                prisma.keyword.deleteMany({ where: { organizationId: user.organizationId } }),
                prisma.user.deleteMany({ where: { organizationId: user.organizationId } }),
                prisma.organization.delete({ where: { id: user.organizationId } })
            ]);
        } else {
            await prisma.user.delete({
                where: { id: user.id }
            });
        }

        return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Account deletion error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
