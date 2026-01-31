import { authOptions } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    const categories = await prisma.feedback.groupBy({
        where: {
            organizationId: session?.user.organizationId
        },
        by : ['primary_category'],
        _count : true
    });

    return NextResponse.json({categories});
}