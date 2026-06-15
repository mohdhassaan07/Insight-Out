import nodemailer from "nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { NextResponse } from "next/server";
import { createOtp, getOtpCooldownRemaining } from "@/src/lib/otp";
import EmailTemplate from "@/src/components/layout/email-template";

export async function POST() {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const otp = await createOtp(email);
        console.log("Generated OTP:", otp);

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
            subject: "OTP Verification",
            html: EmailTemplate({ otp }),
        });

        return NextResponse.json({ message: "OTP sent successfully" });
    } catch (error) {
        if (error instanceof Error && error.message === "Please wait before requesting another OTP") {
            const retryAfter = await getOtpCooldownRemaining(email);
            return NextResponse.json(
                { error: error.message, retryAfter },
                { status: 429 }
            );
        }

        console.error("Error sending email:", error);
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
}
