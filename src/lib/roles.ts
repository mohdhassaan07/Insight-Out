import { authOptions } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";

export const ROLES = ["Admin", "Manager", "Member"] as const;
export type AppRole = (typeof ROLES)[number];

export const TEAM_MANAGED_ROLES = ["Manager", "Member"] as const;
export type TeamManagedRole = (typeof TEAM_MANAGED_ROLES)[number];

export function isAppRole(role: unknown): role is AppRole {
    return typeof role === "string" && ROLES.includes(role as AppRole);
}

export function isTeamManagedRole(role: unknown): role is TeamManagedRole {
    return typeof role === "string" && TEAM_MANAGED_ROLES.includes(role as TeamManagedRole);
}

export async function requireSession() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return { ok: false as const, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            organization: {
                select: { name: true },
            },
        },
    });

    if (!user || !isAppRole(user.role)) {
        return { ok: false as const, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    if (session.user.sessionVersion > 0 && session.user.sessionVersion < user.sessionVersion) {
        return { ok: false as const, response: Response.json({ error: "Session expired" }, { status: 401 }) };
    }

    session.user.id = user.id;
    session.user.name = user.name || "";
    session.user.email = user.email;
    session.user.organizationId = user.organizationId;
    session.user.role = user.role;
    session.user.profilePic = user.profilePic || "";
    session.user.organizationName = user.organization.name || "Unknown Organization";
    session.user.sessionVersion = user.sessionVersion;

    return { ok: true as const, session };
}

export async function requireRole(allowedRoles: AppRole[]) {
    const result = await requireSession();
    if (!result.ok) return result;

    if (!allowedRoles.includes(result.session.user.role)) {
        return { ok: false as const, response: Response.json({ error: "Forbidden" }, { status: 403 }) };
    }

    return { ok: true as const, session: result.session };
}
