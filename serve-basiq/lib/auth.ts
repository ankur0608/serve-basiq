import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    // @ts-ignore - PrismaAdapter type mismatch fix for NextAuth v4
    adapter: PrismaAdapter(prisma),

    session: {
        strategy: "jwt",
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
                otp: { label: "OTP", type: "text" },
            },

            async authorize(credentials) {
                if (!credentials?.phone) {
                    throw new Error("Phone number is required");
                }

                // ⚠️ SECURITY NOTE: You should verify the OTP here before finding the user.
                // const isValidOtp = await verifyOtp(credentials.phone, credentials.otp);
                // if (!isValidOtp) throw new Error("Invalid OTP");

                const user = await prisma.user.findUnique({
                    where: { phone: credentials.phone },
                });

                if (user) {
                    // Ensure we return all the fields needed for the JWT callback
                    return user as any;
                }

                return null;
            },
        }),
    ],

    events: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                // Determine logic for providerType (assuming "google" for google logins)
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        emailVerified: new Date(),

                    },
                });
            }
        },
    },

    callbacks: {
        // 1. JWT Callback: Called whenever a token is created or updated
        async jwt({ token, user, trigger, session }) {
            // Initial Sign In: Copy data from DB User to JWT Token
            if (user) {
                token.id = user.id;
                token.phone = user.phone;
                token.isPhoneVerified = user.isPhoneVerified;
                token.role = user.role;
                token.isWorker = user.isWorker;
                token.providerType = user.providerType;
            }

            // Client-side Update: When you call update({ isPhoneVerified: true }) from the client
            if (trigger === "update" && session) {
                return { ...token, ...session };
            }

            return token;
        },

        // 2. Session Callback: Called whenever useSession() is used
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id;
                session.user.phone = token.phone;
                session.user.isPhoneVerified = token.isPhoneVerified;
                session.user.role = token.role;
                session.user.isWorker = token.isWorker;
                session.user.providerType = token.providerType;
            }

            return session;
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    secret: process.env.AUTH_SECRET,
};