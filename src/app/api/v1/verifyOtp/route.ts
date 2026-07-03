import { NextResponse } from "next/server"
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { verifyOtp } from "@/src/lib/otp";


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

        return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });

    } catch (error) {
        console.error("OTP verification error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}