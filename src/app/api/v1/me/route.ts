import { requireSession } from "@/src/lib/roles";
import { NextResponse } from "next/server";

export async function GET() {
    const auth = await requireSession();
    if (!auth.ok) return auth.response;

    return NextResponse.json({
        user: {
            id: auth.session.user.id,
            name: auth.session.user.name,
            email: auth.session.user.email,
            organizationId: auth.session.user.organizationId,
            organizationName: auth.session.user.organizationName,
            profilePic: auth.session.user.profilePic,
            role: auth.session.user.role,
            sessionVersion: auth.session.user.sessionVersion,
        },
    });
}
