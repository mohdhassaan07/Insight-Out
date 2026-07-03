import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { createOtp, getOtpCooldownRemaining } from "@/src/lib/otp";
import EmailTemplate from "@/src/components/layout/email-template";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "No account found with this email" },
                { status: 404 }
            );
        }

        const otp = await createOtp(email);
        console.log("Forgot password OTP generated for:", email);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset OTP - Insight-Out",
            html: EmailTemplate({ otp }),
        });

        return NextResponse.json({ message: "OTP sent successfully" });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Please wait before requesting another OTP"
        ) {
            const { email } = await req.clone().json();
            const retryAfter = await getOtpCooldownRemaining(email);
            return NextResponse.json(
                { error: error.message, retryAfter },
                { status: 429 }
            );
        }

        console.error("Forgot password send OTP error:", error);
        return NextResponse.json(
            { error: "Failed to send OTP" },
            { status: 500 }
        );
    }
}
