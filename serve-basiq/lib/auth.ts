import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "Mobile Login",
            credentials: {
                phone: { label: "Phone", type: "text" },
                otp: { label: "OTP", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.phone) throw new Error("Phone number is required");
                const user = await prisma.user.findUnique({
                    where: { phone: credentials.phone }
                });
                if (user) return user; // Return the full user object
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // 🔵 Initial Sign In (Google or Credentials)
            if (user) {
                token.id = user.id;
                token.phone = (user as any).phone;
                token.isPhoneVerified = (user as any).isPhoneVerified;

                // ✅ Add these fields to the Token
                token.role = (user as any).role;
                token.isWorker = (user as any).isWorker;
                token.providerType = (user as any).providerType;
            }

            // ✅ Handle Session Update
            if (trigger === "update" && session?.user) {
                return { ...token, ...session.user };
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                session.user.phone = token.phone as string | null;
                session.user.isPhoneVerified = token.isPhoneVerified as boolean;

                // ✅ Pass fields from Token to Session
                // (You might need to update your next-auth.d.ts types to avoid TS errors here)
                (session.user as any).role = token.role;
                (session.user as any).isWorker = token.isWorker;
                (session.user as any).providerType = token.providerType;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login'
    },
    secret: process.env.AUTH_SECRET,
};