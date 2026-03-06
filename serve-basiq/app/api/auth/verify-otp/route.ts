// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// const MAX_FAILED_ATTEMPTS = 5;
// const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// export async function POST(req: Request) {
//   try {
//     const { phone, otp, userId, name } = await req.json();

//     console.log("🚀 [API] Verify Started. Payload:", { phone, otp, name, userId: userId || "NULL" });

//     if (!phone || !otp) {
//       console.log("❌ [API] Missing phone or OTP");
//       return NextResponse.json({ error: "Missing phone or OTP" }, { status: 400 });
//     }

//     // 1. Fetch the OTP and Rate Limit Record
//     const otpRecord = await prisma.otp.findUnique({ where: { phone } });

//     // 2. Check if user is currently locked out
//     if (otpRecord?.lockUntil && otpRecord.lockUntil > new Date()) {
//       console.log("❌ [API] Rate limit active for:", phone);
//       return NextResponse.json({
//         error: "Too many failed attempts. Please try again later.",
//         isLocked: true,
//         lockedUntil: otpRecord.lockUntil
//       }, { status: 429 });
//     }

//     // 3. Validate OTP
//     const isValidCode = otpRecord?.code === otp;
//     const isNotExpired = otpRecord?.expiresAt ? new Date() <= new Date(otpRecord.expiresAt) : false;

//     if (!otpRecord || !isValidCode || !isNotExpired) {
//       console.log("❌ [API] Invalid or Expired OTP");

//       // Handle Failed Attempt
//       const currentAttempts = otpRecord?.attempts || 0;
//       const newAttempts = currentAttempts + 1;
//       let lockUntil: Date | null = null;
//       let isLocked = false;

//       if (newAttempts >= MAX_FAILED_ATTEMPTS) {
//         lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
//         isLocked = true;
//       }

//       await prisma.otp.upsert({
//         where: { phone },
//         update: { attempts: newAttempts, lockUntil },
//         create: { phone, attempts: newAttempts, lockUntil },
//       });

//       return NextResponse.json({
//         error: isLocked ? "Account locked due to too many failed attempts." : "Invalid or expired OTP.",
//         attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts),
//         isLocked,
//         lockedUntil: lockUntil // ✅ FIX: Map to the local variable
//       }, { status: 400 });
//     }

//     console.log("✅ [API] OTP Verified successfully.");

//     // 4. Reset Rate Limit & Delete OTP
//     await prisma.otp.delete({ where: { phone } });

//     let user;

//     if (userId) {
//       console.log(`🔗 [API] Scenario A: Linking phone to UserID: ${userId}`);
//       const existingPhoneUser = await prisma.user.findUnique({ where: { phone } });

//       if (existingPhoneUser && existingPhoneUser.id !== userId) {
//         console.log("⚠️ [API] Conflict: Phone already in use by another user:", existingPhoneUser.id);
//         return NextResponse.json({ error: "Phone number already in use." }, { status: 409 });
//       }

//       user = await prisma.user.update({
//         where: { id: userId },
//         data: { phone, isPhoneVerified: true },
//       });
//       console.log("✅ [API] Account Linked Successfully.");
//     }
//     else {
//       console.log("👤 [API] Scenario B: Standard Login/Register Flow");
//       const existingUser = await prisma.user.findUnique({ where: { phone } });

//       if (existingUser) {
//         console.log("👋 [API] Existing user found:", existingUser.id);
//         const updateData: any = {};

//         if (!existingUser.isPhoneVerified) updateData.isPhoneVerified = true;
//         if (name && !existingUser.name) updateData.name = name;

//         if (Object.keys(updateData).length > 0) {
//           user = await prisma.user.update({ where: { id: existingUser.id }, data: updateData });
//         } else {
//           user = existingUser;
//         }

//       } else {
//         console.log("✨ [API] New User Detected. Creating account...");
//         user = await prisma.user.create({
//           data: {
//             phone: phone,
//             name: name || null,
//             isPhoneVerified: true,
//             role: "USER",
//           },
//         });
//       }
//     }

//     console.log("🏁 [API] Request Complete. Returning user.");
//     return NextResponse.json(user);

//   } catch (error) {
//     console.error("🔥 [API] Verify Error Exception:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { messageCentral } from "@/lib/messageCentral";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: Request) {
  try {
    const { phone, otp, userId, name, verificationId } = await req.json();

    // console.log("🚀 [API] Verify Started.", { phone, userId: userId || "NULL" });

    if (!phone || !otp || !verificationId) {
      return NextResponse.json({ error: "Missing phone, OTP, or Verification ID" }, { status: 400 });
    }

    // --- RATE LIMIT CHECK: START ---
    const rateLimitRecord = await prisma.otp.findUnique({ where: { phone } });

    if (rateLimitRecord?.lockUntil && rateLimitRecord.lockUntil > new Date()) {
      return NextResponse.json({
        error: "Too many failed attempts. Please try again later.",
        isLocked: true,
        lockedUntil: rateLimitRecord.lockUntil
      }, { status: 429 });
    }
    // --- RATE LIMIT CHECK: END ---

    // 1. Verify OTP with MessageCentral
    const isValid = await messageCentral.validateOtp(phone, otp, verificationId);

    if (!isValid) {
      // console.log("❌ [API] Invalid OTP (MessageCentral Rejected)");

      // Handle Rate Limit Failures
      const currentAttempts = rateLimitRecord?.attempts || 0;
      const newAttempts = currentAttempts + 1;
      let lockUntil: Date | null = null;
      let isLocked = false;

      // Lock account if max attempts reached
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        isLocked = true;
      }

      await prisma.otp.upsert({
        where: { phone },
        update: { attempts: newAttempts, lockUntil },
        create: { phone, attempts: newAttempts, lockUntil },
      });

      return NextResponse.json({
        error: isLocked ? "Account temporarily locked." : "Invalid OTP",
        attemptsLeft: Math.max(0, MAX_FAILED_ATTEMPTS - newAttempts),
        isLocked,
        lockedUntil: lockUntil // ✅ FIX: Map the key to the 'lockUntil' variable here
      }, { status: 400 });
    }

    // console.log("✅ [API] OTP Verified successfully.");

    // Reset Rate Limit on successful login
    if (rateLimitRecord) {
      await prisma.otp.delete({ where: { phone } });
    }

    let user;

    if (userId) {
      const existingPhoneUser = await prisma.user.findUnique({ where: { phone } });
      if (existingPhoneUser && existingPhoneUser.id !== userId) {
        return NextResponse.json({ error: "Phone number already in use." }, { status: 409 });
      }
      user = await prisma.user.update({
        where: { id: userId },
        data: { phone, isPhoneVerified: true },
      });
    }

    else {
      const existingUser = await prisma.user.findUnique({ where: { phone } });

      if (existingUser) {
        const updateData: any = {};
        if (!existingUser.isPhoneVerified) updateData.isPhoneVerified = true;
        if (name && !existingUser.name) updateData.name = name;

        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({ where: { id: existingUser.id }, data: updateData });
        } else {
          user = existingUser;
        }
      } else {
        user = await prisma.user.create({
          data: {
            phone: phone,
           name: name || null,
            isPhoneVerified: true,
            role: "USER",
          },
        });
      }
    }

    return NextResponse.json(user);

  } catch (error: any) {
    console.error("🔥 [API] Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}