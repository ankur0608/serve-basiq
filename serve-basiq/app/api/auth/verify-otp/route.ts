import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone, otp, userId } = await req.json();

    // 🔍 1. Log Entrance
    console.log("📲 [API] Verify-Update Request Received:", { phone, otp, userId });

    if (!phone || !otp || !userId) {
      console.log("❌ [API] Validation Failed: Missing required fields");
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 🔍 2. Log OTP Lookup
    console.log("🔍 [API] Looking up OTP record for:", phone);
    const record = await prisma.otp.findFirst({
      where: { phone, code: otp },
    });

    if (!record) {
      console.log("❌ [API] OTP Validation Failed: No matching record found");
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // 🔍 3. Log Expiry Check
    const isExpired = new Date() > new Date(record.expiresAt);
    console.log("⏱️ [API] OTP Expiry Check:", {
      now: new Date(),
      expiresAt: record.expiresAt,
      isExpired
    });

    if (isExpired) {
      console.log("❌ [API] OTP Validation Failed: Code expired");
      return NextResponse.json({ error: "OTP Expired" }, { status: 400 });
    }

    // 🔍 4. Log Conflict Check
    console.log("🕵️ [API] Checking if phone is already claimed by another user...");
    const existingUserWithPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUserWithPhone) {
      console.log("⚠️ [API] Phone exists in DB. Owned by User ID:", existingUserWithPhone.id);

      if (existingUserWithPhone.id !== userId) {
        console.log("⛔ [API] Conflict Detected: Phone owned by DIFFERENT user. Aborting.");
        return NextResponse.json(
          { error: "This phone number is already registered with another account." },
          { status: 409 }
        );
      } else {
        console.log("ℹ️ [API] Phone owned by SAME user. Proceeding with re-verification.");
      }
    } else {
      console.log("✅ [API] Phone is fresh (not in DB). Proceeding.");
    }

    // 🔍 5. Log Update Attempt
    console.log("🔄 [API] Updating User ID:", userId, "with new phone and verified status.");

    // We search by 'id' (userId), NOT by phone.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: phone,
        isPhoneVerified: true,
      },
    });

    console.log("✅ [API] User Update Successful:", {
      id: updatedUser.id,
      phone: updatedUser.phone,
      verified: updatedUser.isPhoneVerified
    });

    // 🔍 6. Log Cleanup
    console.log("🧹 [API] Deleting used OTPs for:", phone);
    await prisma.otp.deleteMany({ where: { phone } });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("🔥 [API] Update Phone Critical Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}