import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    // @ts-ignore
    adapter: PrismaAdapter(prisma),
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
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.phone) throw new Error("Phone number is required");
                const user = await prisma.user.findUnique({
                    where: { phone: credentials.phone },
                });
                if (user) return user as any;
                return null;
            },
        }),
    ],
    events: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { emailVerified: new Date() },
                });
            }
        },
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.phone = user.phone;
                token.isPhoneVerified = user.isPhoneVerified;
                token.role = user.role;
                token.isWorker = user.isWorker;
                token.isWebsite = user.isWebsite;
                token.providerType = user.providerType;
            }
            if (trigger === "update" && session) {
                return { ...token, ...session };
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                // ✅ FIX: Fallback to token.sub if token.id is missing
                session.user.id = (token.id as string) || (token.sub as string);

                session.user.phone = token.phone as string | null;
                session.user.isPhoneVerified = token.isPhoneVerified as boolean;
                session.user.role = token.role as string;
                session.user.isWorker = token.isWorker as boolean;
                session.user.isWebsite = token.isWebsite as boolean;
                session.user.providerType = token.providerType as string | null;
            }
            return session;
        },
    },
    pages: { signIn: "/login", error: "/login" },
    secret: process.env.AUTH_SECRET,
};