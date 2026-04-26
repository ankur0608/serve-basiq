// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// const globalForRateLimit = globalThis as unknown as { otpRequestMap: Map<string, number[]> };
// const otpRequestMap = globalForRateLimit.otpRequestMap || new Map<string, number[]>();
// if (process.env.NODE_ENV !== "production") globalForRateLimit.otpRequestMap = otpRequestMap;

// function checkRateLimit(key: string, limit: number, windowMs: number) {
//   const now = Date.now();
//   const timestamps = otpRequestMap.get(key) || [];
//   const recentRequests = timestamps.filter((time) => now - time < windowMs);

//   if (recentRequests.length >= limit) return false; 

//   recentRequests.push(now);
//   otpRequestMap.set(key, recentRequests);
//   return true; 
// }

// export async function POST(req: Request) {
//   const { phone } = await req.json();

//   if (!phone || phone.length !== 10) {
//     return NextResponse.json(
//       { message: "Invalid phone number" },
//       { status: 400 }
//     );
//   }

//   const isAllowed = checkRateLimit(`send_${phone}`, 3, 5 * 60 * 1000);
//   if (!isAllowed) {
//     return NextResponse.json(
//       { message: "Too many requests. Please wait 5 minutes." },
//       { status: 429 }
//     );
//   }

//   const existingUser = await prisma.user.findUnique({
//     where: { phone },
//   });

//   const isNewUser = !existingUser; 

//   const otp = Math.floor(1000 + Math.random() * 9000).toString();

//   await prisma.otp.deleteMany({ where: { phone } });

//   await prisma.otp.create({
//     data: {
//       phone,
//       code: otp,
//       expiresAt: new Date(Date.now() + 5 * 60 * 1000),
//     },
//   });

//   console.log("DEV OTP:", otp, "| New User:", isNewUser);

//   return NextResponse.json({
//     success: true,
//     otp,
//     isNewUser, 
//   });
// }


//prodction 

// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { messageCentral } from "@/lib/messageCentral";

// export async function POST(req: Request) {
//   try {
//     const { phone } = await req.json();

//     if (!phone || phone.length !== 10) {
//       return NextResponse.json({ message: "Invalid phone number" }, { status: 400 });
//     }

//     // ==========================================
//     // 🛡️ RATE LIMITING LOGIC START
//     // ==========================================

//     // 1. Check if an OTP request was made for this phone recently
//     // We now use the OtpLog table to ensure rate limiting works across all server instances.
//     const lastRequest = await prisma.otpLog.findFirst({
//       where: { phone },
//       orderBy: { createdAt: 'desc' }
//     });

//     if (lastRequest) {
//       const now = new Date();
//       const timeSinceLastRequest = (now.getTime() - lastRequest.createdAt.getTime()) / 1000; // in seconds

//       if (timeSinceLastRequest < 60) {
//         return NextResponse.json(
//           { error: `Please wait ${Math.ceil(60 - timeSinceLastRequest)} seconds before requesting another OTP.` },
//           { status: 429 } 
//         );
//       }
//     }

//     await prisma.otpLog.create({
//       data: { phone }
//     });

//     const existingUser = await prisma.user.findUnique({
//       where: { phone },
//     });

//     const isNewUser = !existingUser;

//     const verificationId = await messageCentral.sendOtp(phone);

//     return NextResponse.json({
//       success: true,
//       verificationId,
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

// api/auth/send-otp/route.ts — complete updated file

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { messageCentral } from "@/lib/messageCentral";

function normalizePhone(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
    return digits.slice(-10);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const phone = normalizePhone(body.phone ?? "");

        if (!phone || phone.length !== 10) {
            return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
        }

        // ── Rate limit ────────────────────────────────────────────────────
        const lastRequest = await prisma.otpLog.findFirst({
            where: { phone },
            orderBy: { createdAt: "desc" },
        });

        if (lastRequest) {
            const elapsed = (Date.now() - lastRequest.createdAt.getTime()) / 1000;
            if (elapsed < 60) {
                return NextResponse.json(
                    { error: `Please wait ${Math.ceil(60 - elapsed)} seconds before requesting another OTP.` },
                    { status: 429 }
                );
            }
        }

        // ── Write new log + clean up stale logs in one go ─────────────────
        await prisma.$transaction([
            prisma.otpLog.create({ data: { phone } }),
            // ✅ Delete logs older than 24 h for this phone
            prisma.otpLog.deleteMany({
                where: {
                    phone,
                    createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            }),
        ]);

        const existingUser  = await prisma.user.findUnique({ where: { phone } });
        const isNewUser     = !existingUser;
        const verificationId = await messageCentral.sendOtp(phone);

        return NextResponse.json({ success: true, verificationId, isNewUser });
    } catch (error: any) {
        console.error("Send OTP error:", error.message);
        return NextResponse.json(
            { error: error.message || "Failed to send OTP" },
            { status: 500 }
        );
    }
}