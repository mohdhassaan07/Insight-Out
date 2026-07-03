import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(req: Request) {
    try {
        const { email, resetToken, newPassword } = await req.json();

        if (!email || !resetToken || !newPassword) {
            return NextResponse.json(
                { error: "Email, reset token, and new password are required" },
                { status: 400 }
            );
        }

        // Validate reset token
        const storedToken = await redis.get<string>(`reset-token:${email}`);

        if (!storedToken || storedToken !== resetToken) {
            return NextResponse.json(
                { error: "Invalid or expired reset token. Please start over." },
                { status: 400 }
            );
        }

        // Validate password length
        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });

        // Clean up reset token
        await redis.del(`reset-token:${email}`);

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { error: "Failed to reset password" },
            { status: 500 }
        );
    }
}
