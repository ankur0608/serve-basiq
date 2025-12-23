export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone, otp, code } = await req.json();
    
    // Support both 'otp' and 'code' keys from frontend
    const submittedCode = otp || code;

    if (!phone || !submittedCode) {
      return NextResponse.json(
        { message: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    // 1. Find the OTP record in the database
    const record = await prisma.otp.findFirst({
      where: {
        phone,
        code: submittedCode,
      },
    });

    if (!record) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // 2. Check if expired
    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json({ message: "OTP Expired" }, { status: 400 });
    }

    // 3. Login/Register the User
    // Use upsert to create a new user if they don't exist
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        isPhoneVerified: true,
      },
      create: {
        phone,
        isPhoneVerified: true,
        isWorker: false, // Default role
        isVerified: false,
      },
    });

    // 4. Cleanup: Delete used OTPs so they can't be reused
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