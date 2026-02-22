import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId: string | undefined = body?.userId;
    const isWebsite: boolean | undefined = body?.isWebsite;

    if (!userId || typeof isWebsite !== "boolean") {
      return NextResponse.json(
        { message: "Invalid payload" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isWebsite },
      select: { id: true },
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
