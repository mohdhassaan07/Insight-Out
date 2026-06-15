import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { NextResponse } from "next/server";
import { createOtp } from "@/src/lib/otp";
import EmailTemplate from "@/src/components/layout/email-template";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const otp = await createOtp(email || "");
    console.log("Generated OTP:", otp);
    try {
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [email || ''],
            subject: 'Your OTP Code',
            html: EmailTemplate({ otp }),
        });

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }
        console.log("Email sent successfully:", data);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}