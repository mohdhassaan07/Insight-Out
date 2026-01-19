import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const reqBody = z.object({
            name: z.string().min(3).max(100).regex(/^[a-zA-Z\s]+$/),
            email: z.string().min(3).max(50).regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
            role: z.string().max(30),
            password: z.string().min(3).max(30),
            confirmPassword: z.string().min(3).max(30)
        })
        const parsedBody = reqBody.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json({ error: parsedBody.error.message }, { status: 400 });
        }
        return NextResponse.json({ body: parsedBody }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}