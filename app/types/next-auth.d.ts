import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            email: string;
            organizationId: string;
            role: string;
        };
    }
    interface User {
        organizationId: string;
        role: string;
    }
}

