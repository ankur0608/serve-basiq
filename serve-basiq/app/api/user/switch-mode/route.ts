import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, isWebsite } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 });
    }

    // Update the user's mode in the database
    await prisma.user.update({
      where: { id: userId },
      data: { isWebsite: isWebsite },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Switch Mode Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}