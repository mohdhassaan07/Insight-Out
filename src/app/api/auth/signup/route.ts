import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const reqBody = z.object({
            orgName: z.string().max(100),
            name: z.string().min(3).max(100).regex(/^[a-zA-Z\s]+$/),
            email: z.string().min(3).max(50).regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
            password: z.string().min(3).max(30),
        })
        const parsedBody = reqBody.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json({ error: "Invalid Input format" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: parsedBody.data.email }
        });
        if (user) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const organization = await prisma.organization.create({
            data: {
                name: parsedBody.data.orgName,
            }
        });
        const hashedPassword = await bcrypt.hash(parsedBody.data.password, 10);
        const newuser = await prisma.user.create({
            data: {
                name: parsedBody.data.name,
                email: parsedBody.data.email,
                password: hashedPassword,
                organizationId: organization.id
            }
        })
        return NextResponse.json({ message: "User created successfully", user: newuser }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}