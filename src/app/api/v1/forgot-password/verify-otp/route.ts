import { NextResponse } from "next/server";
import { verifyOtp } from "@/src/lib/otp";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

const redis = Redis.fromEnv();
const RESET_TOKEN_TTL = 600; // 10 minutes

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const verification = await verifyOtp(email, otp);

        if (!verification.ok) {
            return NextResponse.json(
                { error: verification.message },
                { status: 400 }
            );
        }

        // Generate a reset token and store in Redis
        const resetToken = crypto.randomUUID();
        await redis.set(`reset-token:${email}`, resetToken, {
            ex: RESET_TOKEN_TTL,
        });

        return NextResponse.json(
            { message: "OTP verified successfully", resetToken },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password verify OTP error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
