import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // ✅ Extract 'name' from request body
    const { phone, otp, userId, name } = await req.json();

    console.log("📲 [API] Verify Request:", { phone, otp, name, userId: userId || "N/A" });

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
    // ============================================================
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

    // ============================================================
    // SCENARIO B: Login / Register (No userId provided)
    // ============================================================
    else {
      const existingUser = await prisma.user.findUnique({ where: { phone } });

      if (existingUser) {
        console.log("✅ [API] User found:", existingUser.id);

        // If user exists but has no name, update it? 
        // Or if phone not verified, verify it.
        const updateData: any = {};
        if (!existingUser.isPhoneVerified) updateData.isPhoneVerified = true;

        // Optional: If they provided a name and the database name is null, update it.
        if (name && !existingUser.name) updateData.name = name;

        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: updateData
          });
        } else {
          user = existingUser;
        }

      } else {
        console.log("🆕 [API] Creating new user:", phone);

        // ✅ CREATE NEW USER WITH NAME
        user = await prisma.user.create({
          data: {
            phone: phone,
            name: name || "User", // Use the name from frontend
            isPhoneVerified: true,
            role: "USER",
          },
        });
      }
    }

    // 3. Cleanup
    await prisma.otp.deleteMany({ where: { phone } });

    return NextResponse.json(user);

  } catch (error) {
    console.error("🔥 [API] Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}