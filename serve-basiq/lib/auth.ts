// import { NextAuthOptions, User, Account } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { prisma } from "@/lib/neon";
// import { JWT } from "next-auth/jwt";

// export const authOptions: NextAuthOptions = {
//     adapter: PrismaAdapter(prisma) as any,
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//             allowDangerousEmailAccountLinking: true,
//         }),
//     ],
//     session: { strategy: "jwt" },
//     callbacks: {
//         async signIn({ user, account }: { user: User; account: Account | null }) {
//             console.log("🟡 [SignIn Callback] Triggered");
//             console.log("   - User Email:", user.email);
//             console.log("   - Provider:", account?.provider);

//             // You can add logic here to block sign-ins if needed
//             return true;
//         },
//         async jwt({ token, user }: { token: JWT; user?: User }) {
//             console.log("🔵 [JWT Callback] Triggered");
//             if (user) {
//                 console.log("   - Initial Sign In detected. Adding User ID to token.");
//                 console.log("   - User ID:", user.id);
//                 token.id = user.id;
//             } else {
//                 console.log("   - Subsequent request. Token ID exists:", token.id);
//             }
//             return token;
//         },
//         async session({ session, token }: { session: any; token: JWT }) {
//             console.log("🟢 [Session Callback] Triggered");
//             if (session.user) {
//                 session.user.id = token.id as string;
//                 console.log("   - Attached ID to session user:", session.user.id);
//             }
//             return session;
//         },
//     },
//     pages: { signIn: '/', error: '/' },
//     secret: process.env.AUTH_SECRET,
// };


import { NextAuthOptions, User, Account } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; // ✅ Import this
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/neon";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" }, // Required for Credentials provider to work
    providers: [
        // 1. Google Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),

        // 2. ✅ NEW: Mobile/OTP Login Provider
        CredentialsProvider({
            name: "Mobile Login",
            credentials: {
                phone: { label: "Phone", type: "text" },
                // You can add 'otp' here if you want to verify it inside authorize(),
                // otherwise we assume the OTP was verified on the client before calling signIn()
                otp: { label: "OTP", type: "text" }
            },
            async authorize(credentials) {
                // 1. Validate input
                if (!credentials?.phone) {
                    throw new Error("Phone number is required");
                }

                console.log("🟡 [Credentials Authorize] Looking up user:", credentials.phone);

                // 2. Find user in DB
                const user = await prisma.user.findUnique({
                    where: { phone: credentials.phone }
                });

                // 3. Return user if found (NextAuth will create the session)
                if (user) {
                    console.log("✅ [Credentials Authorize] User found:", user.id);
                    // Return the object that matches the 'User' type
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image || user.profileImage // Handle both field names if necessary
                    };
                }

                // Return null if user not found (client will see error)
                return null;
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }: { user: User; account: Account | null }) {
            console.log("🟡 [SignIn Callback] Triggered");
            console.log("   - User Email/Phone:", user.email || "Phone User");
            console.log("   - Provider:", account?.provider);
            return true;
        },
        async jwt({ token, user, trigger, session }: { token: JWT; user?: User; trigger?: string; session?: any }) {
            console.log("🔵 [JWT Callback] Triggered");

            // Initial Sign In
            if (user) {
                console.log("   - Initial Sign In. Adding User ID to token.");
                token.id = user.id;
            }

            // ✅ Support for Updating Session (e.g. after Profile Edit)
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }

            return token;
        },
        async session({ session, token }: { session: any; token: JWT }) {
            console.log("🟢 [Session Callback] Triggered");

            // ✅ Ensure User ID is always available in the session
            if (session.user && token.id) {
                session.user.id = token.id as string;
                // console.log("   - Attached ID to session user:", session.user.id);
            }
            return session;
        },
    },
    pages: {
        signIn: '/login', // Ensure this matches your login route
        error: '/login'   // Redirect errors back to login
    },
    secret: process.env.AUTH_SECRET,
};