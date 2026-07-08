import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

type SessionRole = "Admin" | "Manager" | "Member";

export const authOptions: NextAuthOptions = {
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
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const organization = await prisma.organization.findUnique({
          where: { id: user.organizationId }
        });

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic ?? "",
          organizationId: user.organizationId,
          role: user.role,
          organizationName: organization?.name || "Unknown Organization",
          sessionVersion: user.sessionVersion
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.id = user.id;
        token.email = user.email;
        token.organizationId = user.organizationId;
        token.role = user.role;
        token.profilePic = user.profilePic as string;
        token.organizationName = user.organizationName;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    session({ session, token }) {
      session.user.name = token.name as string;
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.organizationId = token.organizationId as string;
      session.user.role = token.role as SessionRole;
      session.user.profilePic = token.profilePic as string;
      session.user.organizationName = token.organizationName as string;
      session.user.sessionVersion = Number(token.sessionVersion ?? 0);
      return session;
    }
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
