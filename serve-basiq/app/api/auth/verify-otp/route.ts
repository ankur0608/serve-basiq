export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone, otp, code } = await req.json();

    const submittedCode = otp || code;

    if (!phone || !submittedCode) {
      return NextResponse.json(
        { message: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    // 1. Find OTP
    const record = await prisma.otp.findFirst({
      where: { phone, code: submittedCode },
    });

    if (!record) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json({ message: "OTP Expired" }, { status: 400 });
    }

    // 3. Login/Register
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        isPhoneVerified: true,
        isWebsite: true, // ✅ Force Website Mode on Login
      },
      create: {
        phone,
        isPhoneVerified: true,
        isWorker: false,
        isVerified: false,
        isWebsite: true, // ✅ Default to Website Mode
        profileImage: "",
      },
    });

    // 4. Cleanup
    await prisma.otp.deleteMany({
      where: { phone },
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("Verify Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}