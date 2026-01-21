import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // userId is now OPTIONAL
    const { phone, otp, userId } = await req.json();

    console.log("📲 [API] Verify Request:", { phone, otp, userId: userId || "N/A (Login Mode)" });

    if (!phone || !otp) {
      return NextResponse.json({ error: "Missing phone or OTP" }, { status: 400 });
    }

    // 1. Verify OTP
    const record = await prisma.otp.findFirst({
      where: { phone, code: otp },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json({ error: "OTP Expired" }, { status: 400 });
    }

    let user;

    // ============================================================
    // SCENARIO A: Account Linking (userId provided)
    // The user is already logged in and wants to verify/link a phone
    // ============================================================
    if (userId) {
      // Check collision: Is this phone already claimed by ANOTHER user?
      const existingPhoneUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhoneUser && existingPhoneUser.id !== userId) {
        return NextResponse.json(
          { error: "Phone number already in use by another account." },
          { status: 409 }
        );
      }

      // Update the requested user
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          phone: phone,
          isPhoneVerified: true,
        },
      });
    }

    // ============================================================
    // SCENARIO B: Login / Register (No userId provided)
    // The user is trying to log in via phone. We find or create them.
    // ============================================================
    else {
      // Find existing user by phone
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        console.log("✅ [API] User found for login:", existingUser.id);
        user = existingUser;

        if (!existingUser.isPhoneVerified) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { isPhoneVerified: true }
          });
        }

      } else {
        console.log("🆕 [API] Creating new user for phone:", phone);
        user = await prisma.user.create({
          data: {
            phone: phone,
            isPhoneVerified: true,
            // Add any default fields here (e.g., name: "User", role: "USER")
          },
        });
      }
    }

    // 3. Cleanup OTP
    await prisma.otp.deleteMany({ where: { phone } });

    return NextResponse.json(user);

  } catch (error) {
    console.error("🔥 [API] Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}