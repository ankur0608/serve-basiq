import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const THREE_MONTHS_SECONDS = 90 * 24 * 60 * 60;

async function resolveUserFromToken(token: {
    id?: string;
    email?: string | null;
    phone?: string | null;
}) {
    if (token.id) {
        const userById = await prisma.user.findUnique({
            where: { id: token.id },
        });

        if (userById) {
            return userById;
        }
    }

    const fallbackFilters = [
        token.email ? { email: token.email } : null,
        token.phone ? { phone: token.phone } : null,
    ].filter(Boolean) as Array<{ email?: string; phone?: string }>;

    if (fallbackFilters.length === 0) {
        return null;
    }

    return prisma.user.findFirst({
        where: { OR: fallbackFilters },
    });
}

export const authOptions: NextAuthOptions = {
    // @ts-ignore
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
        maxAge: THREE_MONTHS_SECONDS,
        updateAge: 24 * 60 * 60,
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
                if (!credentials?.phone) {
                    throw new Error("Phone number is required");
                }

                const user = await prisma.user.findUnique({
                    where: { phone: credentials.phone },
                });

                return user ? (user as any) : null;
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
        async signOut({ token }: { token: any }) {
            if (token?.id) {
                await prisma.user.update({
                    where: { id: token.id as string },
                    data: { isOnline: false },
                }).catch(() => {});
            }
        },
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.phone = (user as any).phone;
                token.isPhoneVerified = (user as any).isPhoneVerified;
                token.role = (user as any).role;
                token.isWorker = (user as any).isWorker;
                token.isWebsite = (user as any).isWebsite;
                token.issuedAt = Date.now();
            }

            if (trigger === "update" || token.id) {
                const resolvedUser = await resolveUserFromToken({
                    id: token.id as string | undefined,
                    email: token.email,
                    phone: token.phone as string | null | undefined,
                });

                if (resolvedUser) {
                    token.id = resolvedUser.id;
                    token.phone = resolvedUser.phone;
                    token.isPhoneVerified = resolvedUser.isPhoneVerified;
                    token.role = resolvedUser.role;
                    token.isWorker = resolvedUser.isWorker;
                    token.isWebsite = resolvedUser.isWebsite;
                }

                if (trigger === "update") {
                    token.issuedAt = Date.now();
                }
            }

            const issuedAt = token.issuedAt as number | undefined;
            if (issuedAt && Date.now() - issuedAt > THREE_MONTHS_SECONDS * 1000) {
                return null as any;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = (token.id as string) || (token.sub as string);
                session.user.phone = token.phone as string | null;
                session.user.isPhoneVerified = token.isPhoneVerified as boolean;
                session.user.role = token.role as string;
                session.user.isWorker = token.isWorker as boolean;
                session.user.isWebsite = token.isWebsite as boolean;
            }

            return session;
        },
    },
    pages: { signIn: "/login", error: "/login" },
    secret: process.env.AUTH_SECRET,
};
