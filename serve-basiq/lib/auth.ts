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
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; // Ensure this path matches your project
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" },
    providers: [
        // 1. Google Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),

        // 2. Mobile/OTP Login Provider
        CredentialsProvider({
            name: "Mobile Login",
            credentials: {
                phone: { label: "Phone", type: "text" },
                otp: { label: "OTP", type: "text" }
            },
            async authorize(credentials) {
                console.log("🔥 [Auth] Credentials Authorize Start:", credentials);

                if (!credentials?.phone) {
                    throw new Error("Phone number is required");
                }

                // Find user
                const user = await prisma.user.findUnique({
                    where: { phone: credentials.phone }
                });

                console.log("🔍 [Auth] Database User Found:", user ? "Yes" : "No", user?.id);

                if (user) {
                    // ✅ Return extended user object
                    const returnedUser = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image || user.profileImage,
                        phone: user.phone,
                        isPhoneVerified: user.isPhoneVerified
                    };
                    console.log("✅ [Auth] Authorize Success, returning:", returnedUser);
                    return returnedUser;
                }

                console.log("❌ [Auth] Authorize Failed: User not found");
                return null;
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            console.log("🚪 [Auth] SignIn Callback:", { userId: user.id, provider: account?.provider });
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            // 🔵 Initial Sign In
            if (user) {
                console.log("🎟️ [Auth] JWT Initializing for User:", user.id);
                token.id = user.id;
                token.phone = (user as any).phone;
                token.isPhoneVerified = (user as any).isPhoneVerified;
            }

            // ✅ Handle Session Update (Triggered from Client)
            if (trigger === "update" && session?.user) {
                console.log("🔄 [Auth] JWT Update Triggered. Merging session data:", session.user);
                return { ...token, ...session.user };
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                session.user.phone = token.phone as string | null;
                session.user.isPhoneVerified = token.isPhoneVerified as boolean;

                // console.log("📦 [Auth] Session Callback Returning:", { 
                //     id: session.user.id, 
                //     phone: session.user.phone, 
                //     verified: session.user.isPhoneVerified 
                // });
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