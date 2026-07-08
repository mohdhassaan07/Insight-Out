import "next-auth";

type Role = "Admin" | "Manager" | "Member";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            organizationId: string;
            profilePic: string;
            role: Role;
            organizationName: string;
            sessionVersion: number;
        };
    }
    interface User {
        id: string;
        organizationId: string;
        role: Role;
        organizationName: string;
        profilePic: string;
        sessionVersion: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        organizationId: string;
        role: Role;
        organizationName: string;
        profilePic: string;
        sessionVersion?: number;
    }
}
