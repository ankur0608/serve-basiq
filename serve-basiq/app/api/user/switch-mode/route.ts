import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force Node runtime (Prisma + Edge is slow/unstable)
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Parse request body once
    const body = await req.json();
    const userId: string | undefined = body?.userId;
    const isWebsite: boolean | undefined = body?.isWebsite;

    // Fast validation (avoid unnecessary DB hit)
    if (!userId || typeof isWebsite !== "boolean") {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      );
    }

    // Fast indexed update (primary key lookup)
    await prisma.user.update({
      where: { id: userId },
      data: { isWebsite },
      select: { id: true }, // prevents fetching full row
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Switch Mode Error:", error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}
