// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const userId: string | undefined = body?.userId;
//     const isWebsite: boolean | undefined = body?.isWebsite;

//     if (!userId || typeof isWebsite !== "boolean") {
//       return NextResponse.json(
//         { message: "Invalid payload" },
//         { status: 400 }
//       );
//     }

//     await prisma.user.update({
//       where: { id: userId },
//       data: { isWebsite },
//       select: { id: true },
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Switch Mode Error:", error);

//     return NextResponse.json(
//       { message: "Server Error" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { isWebsite, userId } = await req.json();

    // Security: Ensure user can only switch their own mode
    if (userId && userId !== session.user.id) return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    if (typeof isWebsite !== "boolean") return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { isWebsite },
      select: { id: true }, // 🚀 High Speed Optimized Selection
    });

    return NextResponse.json({
      success: true,
      mode: isWebsite ? "CUSTOMER" : "PROVIDER",
      syncedAt: new Date().getTime()
    });
  } catch (error) {
    console.error("🔥 [API] Switch Mode Failure:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
