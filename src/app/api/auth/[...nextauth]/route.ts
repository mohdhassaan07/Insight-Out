import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
    session: {
        strategy: "jwt"
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }
                console.log("Authorizing user with email:", credentials.email);
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    throw new Error("User not found");
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    name : user.name,
                    email: user.email,
                    organizationId: user.organizationId,
                    role: user.role
                };
            }
        })
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.name = user.name;
                token.organizationId = user.organizationId;
                token.role = user.role;
            }
            return token;
        },
        session({ session, token }) {
            session.user.name = token.name as string;
            session.user.organizationId = token.organizationId as string;
            session.user.role = token.role as string;
            return session;
        }
    },
    pages: {
        signIn: '/signin',
        signOut: '/signout',
    },
    secret : process.env.NEXTAUTH_SECRET,
})
export { handler as GET, handler as POST };