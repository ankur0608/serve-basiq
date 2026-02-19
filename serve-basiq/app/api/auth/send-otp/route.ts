export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// --- RATE LIMITER SETUP ---
const globalForRateLimit = globalThis as unknown as { otpRequestMap: Map<string, number[]> };
const otpRequestMap = globalForRateLimit.otpRequestMap || new Map<string, number[]>();
if (process.env.NODE_ENV !== "production") globalForRateLimit.otpRequestMap = otpRequestMap;

function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const timestamps = otpRequestMap.get(key) || [];
  const recentRequests = timestamps.filter((time) => now - time < windowMs);
  
  if (recentRequests.length >= limit) return false; // Rate limit exceeded
  
  recentRequests.push(now);
  otpRequestMap.set(key, recentRequests);
  return true; // Allowed
}
// --------------------------

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!phone || phone.length !== 10) {
    return NextResponse.json(
      { message: "Invalid phone number" },
      { status: 400 }
    );
  }

  // ⏳ RATE LIMIT: Max 3 OTP requests per 5 minutes per phone number
  const isAllowed = checkRateLimit(`send_${phone}`, 3, 5 * 60 * 1000);
  if (!isAllowed) {
    return NextResponse.json(
      { message: "Too many requests. Please wait 5 minutes." },
      { status: 429 }
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


// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { messageCentral } from "@/lib/messageCentral"; // Import helper

// export async function POST(req: Request) {
//   try {
//     const { phone } = await req.json();

//     if (!phone || phone.length !== 10) {
//       return NextResponse.json(
//         { message: "Invalid phone number" },
//         { status: 400 }
//       );
//     }

//     // 1. Check if user exists (Logic remains same)
//     const existingUser = await prisma.user.findUnique({
//       where: { phone },
//     });

//     const isNewUser = !existingUser;

//     // 2. Send OTP via MessageCentral
//     // This replaces your manual Math.random logic
//     console.log("🚀 [API] Sending OTP via MessageCentral...");
//     const verificationId = await messageCentral.sendOtp(phone);
//     console.log("✅ [API] OTP Sent. Verification ID:", verificationId);

//     // 3. We NO LONGER save OTP to Prisma. MessageCentral handles the state.
//     // We just need to cleanup old manual OTPs if you want to keep DB clean
//     await prisma.otp.deleteMany({ where: { phone } });

//     return NextResponse.json({
//       success: true,
//       verificationId, // ✅ Send this to frontend, it's required for verification
//       isNewUser,
//     });
//   } catch (error: any) {
//     console.error("🔥 [API] Send OTP Error:", error.message);
//     return NextResponse.json(
//       { error: error.message || "Failed to send OTP" },
//       { status: 500 }
//     );
//   }
// }