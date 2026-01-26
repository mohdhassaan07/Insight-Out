import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth"

export async function GET(){
    const session = await getServerSession(authOptions);
    console.log("organization :", session?.user.organizationId);

    if(!session){
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }
    try {
        const feedbacks = await prisma.feedback.findMany({
            where : {
                organizationId: session?.user.organizationId
            }
        })
        return NextResponse.json({feedbacks}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Failed to fetch feedbacks"}, {status: 500});
    }

}