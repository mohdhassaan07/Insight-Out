import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            name: string;
            email: string;
            organizationId: string;
            role: string;
            organizationName: string;
        };
    }
    interface User {
        organizationId: string;
        role: string;
        organizationName: string;
    }
}

