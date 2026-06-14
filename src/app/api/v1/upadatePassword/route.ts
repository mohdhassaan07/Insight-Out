import { authOptions } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { currentPassword, newPassword } = await req.json();

        // Validate input
        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 });
        }
        
        const user = await prisma.user.findUnique({
            where: { email: session?.user.email},
        });
        if(!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const comparePassword = await bcrypt.compare(currentPassword, user.password);
        if (!comparePassword) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
        }
        if(currentPassword === newPassword) {
            return NextResponse.json({ error: "New password must be different from current password" }, { status: 400 });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        await prisma.user.update({
            where : {id : user.id},
            data : {password : hashedNewPassword}
        });
        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
        
    } catch (error) {
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }
}