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

  // 1. Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  const isNewUser = !existingUser; // True if user is NOT in DB

  // 2. Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // 3. Save OTP
  await prisma.otp.deleteMany({ where: { phone } });

  await prisma.otp.create({
    data: {
      phone,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  console.log("DEV OTP:", otp, "| New User:", isNewUser);

  return NextResponse.json({
    success: true,
    otp,
    isNewUser, // ✅ Send this flag to frontend
  });
}