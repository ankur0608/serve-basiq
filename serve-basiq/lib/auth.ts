import { NextAuthOptions, User, Account } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/neon";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ user, account }: { user: User; account: Account | null }) {
            console.log("🟡 [SignIn Callback] Triggered");
            console.log("   - User Email:", user.email);
            console.log("   - Provider:", account?.provider);

            // You can add logic here to block sign-ins if needed
            return true;
        },
        async jwt({ token, user }: { token: JWT; user?: User }) {
            console.log("🔵 [JWT Callback] Triggered");
            if (user) {
                console.log("   - Initial Sign In detected. Adding User ID to token.");
                console.log("   - User ID:", user.id);
                token.id = user.id;
            } else {
                console.log("   - Subsequent request. Token ID exists:", token.id);
            }
            return token;
        },
        async session({ session, token }: { session: any; token: JWT }) {
            console.log("🟢 [Session Callback] Triggered");
            if (session.user) {
                session.user.id = token.id as string;
                console.log("   - Attached ID to session user:", session.user.id);
            }
            return session;
        },
    },
    pages: { signIn: '/', error: '/' },
    secret: process.env.AUTH_SECRET,
};