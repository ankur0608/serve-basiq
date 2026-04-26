// import { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";

// export const authOptions: NextAuthOptions = {
//     // @ts-ignore
//     adapter: PrismaAdapter(prisma),
//     session: { strategy: "jwt" },
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//             allowDangerousEmailAccountLinking: true,
//         }),
//         CredentialsProvider({
//             name: "Mobile Login",
//             credentials: {
//                 phone: { label: "Phone", type: "text" },
//                 otp: { label: "OTP", type: "text" },
//             },
//             async authorize(credentials) {
//                 if (!credentials?.phone) throw new Error("Phone number is required");
//                 const user = await prisma.user.findUnique({
//                     where: { phone: credentials.phone },
//                 });
//                 if (user) return user as any;
//                 return null;
//             },
//         }),
//     ],
//     events: {
//         async signIn({ user, account }) {
//             if (account?.provider === "google") {
//                 await prisma.user.update({
//                     where: { id: user.id },
//                     data: { emailVerified: new Date() },
//                 });
//             }
//         },
//     },
//     callbacks: {
//         async jwt({ token, user, trigger }) {
//             // 1. Initial Sign In
//             if (user) {
//                 token.id = user.id;
//                 token.phone = user.phone;
//                 token.isPhoneVerified = user.isPhoneVerified;
//                 token.role = user.role;
//                 token.isWorker = user.isWorker;
//                 token.isWebsite = user.isWebsite;
//                 token.providerType = user.providerType;
//             }

//             // 2. 🚀 Securely fetch fresh data from DB on update
//             if (trigger === "update") {
//                 const freshUser = await prisma.user.findUnique({
//                     where: { id: token.id as string }
//                 });

//                 if (freshUser) {
//                     token.isWorker = freshUser.isWorker;
//                     token.providerType = freshUser.providerType;
//                     token.role = freshUser.role;

//                     // ✅ ADDED THESE TWO LINES TO FIX THE BUG
//                     token.phone = freshUser.phone;
//                     token.isPhoneVerified = freshUser.isPhoneVerified;
//                 }
//             }

//             return token;
//         },
//         async session({ session, token }) {
//             if (session.user && token) {
//                 session.user.id = (token.id as string) || (token.sub as string);
//                 session.user.phone = token.phone as string | null;
//                 session.user.isPhoneVerified = token.isPhoneVerified as boolean;
//                 session.user.role = token.role as string;
//                 session.user.isWorker = token.isWorker as boolean;
//                 session.user.isWebsite = token.isWebsite as boolean;
//                 session.user.providerType = token.providerType as string | null;
//             }
//             return session;
//         },
//     },
//     pages: { signIn: "/login", error: "/login" },
//     secret: process.env.AUTH_SECRET,
// };


//prodction


// import { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";

// export const authOptions: NextAuthOptions = {
//     // @ts-ignore
//     adapter: PrismaAdapter(prisma),
//     session: { strategy: "jwt" },
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//             allowDangerousEmailAccountLinking: true,
//         }),
//         CredentialsProvider({
//             name: "Mobile Login",
//             credentials: {
//                 phone: { label: "Phone", type: "text" },
//                 otp: { label: "OTP", type: "text" },
//             },
//             async authorize(credentials) {
//                 if (!credentials?.phone) throw new Error("Phone number is required");
//                 const user = await prisma.user.findUnique({
//                     where: { phone: credentials.phone },
//                 });
//                 if (user) return user as any;
//                 return null;
//             },
//         }),
//     ],
//     events: {
//         // ✅ UPDATED: This runs every time a user successfully logs in
//         async signIn({ user, account }) {
//             const updateData: any = {
//                 isOnline: true // Set user to online regardless of how they logged in
//             };

//             // If they logged in via Google, also verify their email
//             if (account?.provider === "google") {
//                 updateData.emailVerified = new Date();
//             }

//             if (user?.id) {
//                 await prisma.user.update({
//                     where: { id: user.id },
//                     data: updateData,
//                 });
//             }
//         },
//     },
//     callbacks: {
//         async jwt({ token, user, trigger }) {
//             // 1. Initial Sign In
//             if (user) {
//                 token.id = user.id;
//                 token.phone = user.phone;
//                 token.isPhoneVerified = user.isPhoneVerified;
//                 token.role = user.role;
//                 token.isWorker = user.isWorker;
//                 token.isWebsite = user.isWebsite;
//                 token.providerType = user.providerType;
//             }

//             // 2. 🚀 Securely fetch fresh data from DB on update
//             if (trigger === "update") {
//                 const freshUser = await prisma.user.findUnique({
//                     where: { id: token.id as string }
//                 });

//                 if (freshUser) {
//                     token.isWorker = freshUser.isWorker;
//                     token.providerType = freshUser.providerType;
//                     token.role = freshUser.role;
//                     token.phone = freshUser.phone;
//                     token.isPhoneVerified = freshUser.isPhoneVerified;
//                 }
//             }

//             return token;
//         },
//         async session({ session, token }) {
//             if (session.user && token) {
//                 session.user.id = (token.id as string) || (token.sub as string);
//                 session.user.phone = token.phone as string | null;
//                 session.user.isPhoneVerified = token.isPhoneVerified as boolean;
//                 session.user.role = token.role as string;
//                 session.user.isWorker = token.isWorker as boolean;
//                 session.user.isWebsite = token.isWebsite as boolean;
//                 session.user.providerType = token.providerType as string | null;
//             }
//             return session;
//         },
//     },
//     pages: { signIn: "/login", error: "/login" },
//     secret: process.env.AUTH_SECRET,
// };

// lib/auth.ts — complete updated file

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters"; // Add this import
const THREE_MONTHS_SECONDS = 90 * 24 * 60 * 60; // 7,776,000 seconds

export const authOptions: NextAuthOptions = {
    // @ts-ignore
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
        maxAge: THREE_MONTHS_SECONDS,       // absolute expiry
        updateAge: 24 * 60 * 60,            // only re-issue JWT once per day
    },
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
            const updateData: any = { isOnline: true };
            if (account?.provider === "google") {
                updateData.emailVerified = new Date();
            }
            if (user?.id) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: updateData,
                });
            }
        },

        // ✅ NEW: set isOnline false on explicit logout
        async signOut({ token }: { token: any }) {
            if (token?.id) {
                await prisma.user.update({
                    where: { id: token.id as string },
                    data: { isOnline: false },
                }).catch(() => {}); // swallow errors — logout must never fail
            }
        },
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            // ── Initial sign-in ──────────────────────────────────────────
            if (user) {
                token.id              = user.id;
                token.phone           = (user as any).phone;
                token.isPhoneVerified = (user as any).isPhoneVerified;
                token.role            = (user as any).role;
                token.isWorker        = (user as any).isWorker;
                token.isWebsite       = (user as any).isWebsite;
                token.providerType    = (user as any).providerType;
                token.issuedAt        = Date.now();         // ✅ stamp issue time
            }

            // ── Triggered session.update() call ─────────────────────────
            if (trigger === "update") {
                const freshUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                });
                if (freshUser) {
                    token.isWorker        = freshUser.isWorker;
                    token.providerType    = freshUser.providerType;
                    token.role            = freshUser.role;
                    token.phone           = freshUser.phone;
                    token.isPhoneVerified = freshUser.isPhoneVerified;
                }
                token.issuedAt = Date.now();                // ✅ refresh the stamp
            }

            // ── Force logout if token is older than 3 months ─────────────
            // This is the server-side guard. The cookie maxAge already handles
            // browser-side expiry, but this protects tampered / long-lived tokens.
            const issuedAt = token.issuedAt as number | undefined;
            if (issuedAt && Date.now() - issuedAt > THREE_MONTHS_SECONDS * 1000) {
                // Returning null from jwt() invalidates the session
                return null as any;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user && token) {
                session.user.id              = (token.id as string) || (token.sub as string);
                session.user.phone           = token.phone           as string | null;
                session.user.isPhoneVerified = token.isPhoneVerified as boolean;
                session.user.role            = token.role            as string;
                session.user.isWorker        = token.isWorker        as boolean;
                session.user.isWebsite       = token.isWebsite       as boolean;
                session.user.providerType    = token.providerType    as string | null;
            }
            return session;
        },
    },
    pages: { signIn: "/login", error: "/login" },
    secret: process.env.AUTH_SECRET,
};