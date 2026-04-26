// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function POST() {
//   try {
//     const cookieStore = await cookies();

//     const cookiesToDelete = [
//       "next-auth.session-token",
//       "__Secure-next-auth.session-token",
//       "next-auth.csrf-token",
//       "__Host-next-auth.csrf-token",
//       "next-auth.callback-url",
//       "__Secure-next-auth.callback-url",
//       "next-auth.state",
//       "__Secure-next-auth.state"
//     ];

//     cookiesToDelete.forEach((cookieName) => {
//       cookieStore.set(cookieName, "", { maxAge: 0, path: "/" });
//     });

//     return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ message: "Logout processed" }, { status: 200 });
//   }
// }

//prodction

// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";
// import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth"; // Make sure this path points to your NextAuth config

// export async function POST() {
//   try {
//     // ✅ 1. Identify the user before logging them out
//     const session = await getServerSession(authOptions);

//     // ✅ 2. Set isOnline to false in the database
//     if (session?.user?.id) {
//       await prisma.user.update({
//         where: { id: session.user.id },
//         data: { isOnline: false }
//       });
//     }

//     // 3. Delete cookies
//     const cookieStore = await cookies();

//     const cookiesToDelete = [
//       "next-auth.session-token",
//       "__Secure-next-auth.session-token",
//       "next-auth.csrf-token",
//       "__Host-next-auth.csrf-token",
//       "next-auth.callback-url",
//       "__Secure-next-auth.callback-url",
//       "next-auth.state",
//       "__Secure-next-auth.state"
//     ];

//     cookiesToDelete.forEach((cookieName) => {
//       cookieStore.set(cookieName, "", { maxAge: 0, path: "/" });
//     });

//     return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("🔥 Logout Error:", error);
//     return NextResponse.json({ message: "Logout processed" }, { status: 200 });
//   }
// }

// api/auth/logout/route.ts — complete updated file

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        // ✅ Set isOnline false (belt-and-suspenders alongside the signOut event)
        if (session?.user?.id) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { isOnline: false },
            }).catch(() => {});
        }

        const cookieStore = await cookies();

        const cookiesToDelete = [
            "next-auth.session-token",
            "__Secure-next-auth.session-token",
            "next-auth.csrf-token",
            "__Host-next-auth.csrf-token",
            "next-auth.callback-url",
            "__Secure-next-auth.callback-url",
            "next-auth.state",
            "__Secure-next-auth.state",
        ];

        cookiesToDelete.forEach((name) => {
            cookieStore.set(name, "", { maxAge: 0, path: "/" });
        });

        return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ message: "Logout processed" }, { status: 200 });
    }
}