export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!phone || phone.length !== 10) {
    return NextResponse.json(
      { message: "Invalid phone number" },
      { status: 400 }
    );
  }

  // 🔢 Generate random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Remove previous OTPs
  await prisma.otp.deleteMany({
    where: { phone },
  });

  // Create new OTP
  await prisma.otp.create({
    data: {
      phone,
      code: otp,
      // purpose line is removed
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    },
  });

  console.log("DEV OTP:", otp);

  return NextResponse.json({
    success: true,
    otp, 
  });
}