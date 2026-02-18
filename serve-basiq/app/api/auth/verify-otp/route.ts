import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // ✅ Extract 'name' from request body
    const { phone, otp, userId, name } = await req.json();

    console.log("🚀 [API] Verify Started. Payload:", { phone, otp, name, userId: userId || "NULL" });

    if (!phone || !otp) {
      console.log("❌ [API] Missing phone or OTP");
      return NextResponse.json({ error: "Missing phone or OTP" }, { status: 400 });
    }

    // 1. Verify OTP
    console.log("🔍 [API] Searching for OTP record...");
    const record = await prisma.otp.findFirst({
      where: { phone, code: otp },
    });

    if (!record) {
      console.log("❌ [API] Invalid OTP (No record found)");
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > new Date(record.expiresAt)) {
      console.log("❌ [API] OTP Expired. Current:", new Date(), "Expires:", record.expiresAt);
      return NextResponse.json({ error: "OTP Expired" }, { status: 400 });
    }

    console.log("✅ [API] OTP Verified successfully.");

    let user;

    // ============================================================
    // SCENARIO A: Account Linking (userId provided)
    // ============================================================
    if (userId) {
      console.log(`🔗 [API] Scenario A: Linking phone to UserID: ${userId}`);

      const existingPhoneUser = await prisma.user.findUnique({ where: { phone } });

      if (existingPhoneUser && existingPhoneUser.id !== userId) {
        console.log("⚠️ [API] Conflict: Phone already in use by another user:", existingPhoneUser.id);
        return NextResponse.json({ error: "Phone number already in use." }, { status: 409 });
      }

      user = await prisma.user.update({
        where: { id: userId },
        data: { phone, isPhoneVerified: true },
      });
      console.log("✅ [API] Account Linked Successfully.");
    }

    // ============================================================
    // SCENARIO B: Login / Register (No userId provided)
    // ============================================================
    else {
      console.log("👤 [API] Scenario B: Standard Login/Register Flow");

      const existingUser = await prisma.user.findUnique({ where: { phone } });

      if (existingUser) {
        console.log("👋 [API] Existing user found:", existingUser.id);

        // Logic to determine if update is needed
        const updateData: any = {};

        if (!existingUser.isPhoneVerified) {
          console.log("🔹 [API] Marking phone as verified.");
          updateData.isPhoneVerified = true;
        }

        // Optional: Update name if provided and missing in DB
        if (name && !existingUser.name) {
          console.log(`🔹 [API] Updating missing name to: ${name}`);
          updateData.name = name;
        }

        if (Object.keys(updateData).length > 0) {
          console.log("💾 [API] Saving updates to DB...", updateData);
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: updateData
          });
        } else {
          console.log("⏩ [API] No updates needed. Returning existing user.");
          user = existingUser;
        }

      } else {
        console.log("✨ [API] New User Detected. Creating account...");
        console.log(`📝 [API] Name provided: ${name || "User (Default)"}`);

        // ✅ CREATE NEW USER WITH NAME
        user = await prisma.user.create({
          data: {
            phone: phone,
            name: name || "User", // Use the name from frontend
            isPhoneVerified: true,
            role: "USER",
            // Note: providerType is optional now, so we don't need to pass it
          },
        });
        console.log("✅ [API] New User Created with ID:", user.id);
      }
    }

    // 3. Cleanup
    console.log("🧹 [API] Deleting used OTP...");
    await prisma.otp.deleteMany({ where: { phone } });

    console.log("🏁 [API] Request Complete. Returning user.");
    return NextResponse.json(user);

  } catch (error) {
    console.error("🔥 [API] Verify Error Exception:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { messageCentral } from "@/lib/messageCentral";

// export async function POST(req: Request) {
//   try {
//     // ✅ Extract verificationId from request
//     const { phone, otp, userId, name, verificationId } = await req.json();

//     console.log("🚀 [API] Verify Started.", { phone, userId: userId || "NULL" });

//     if (!phone || !otp || !verificationId) {
//       return NextResponse.json({ error: "Missing phone, OTP, or Verification ID" }, { status: 400 });
//     }

//     // 1. Verify OTP with MessageCentral
//     const isValid = await messageCentral.validateOtp(phone, otp, verificationId);

//     if (!isValid) {
//       console.log("❌ [API] Invalid OTP (MessageCentral Rejected)");
//       return NextResponse.json({ error: "Invalid or Expired OTP" }, { status: 400 });
//     }

//     console.log("✅ [API] OTP Verified successfully.");

//     let user;

//     // ============================================================
//     // SCENARIO A: Account Linking (userId provided)
//     // ============================================================
//     if (userId) {
//       // ... (Keep your existing Account Linking logic exactly as is)
//       const existingPhoneUser = await prisma.user.findUnique({ where: { phone } });
//       if (existingPhoneUser && existingPhoneUser.id !== userId) {
//         return NextResponse.json({ error: "Phone number already in use." }, { status: 409 });
//       }
//       user = await prisma.user.update({
//         where: { id: userId },
//         data: { phone, isPhoneVerified: true },
//       });
//     }

//     // ============================================================
//     // SCENARIO B: Login / Register (No userId provided)
//     // ============================================================
//     else {
//       // ... (Keep your existing Login/Register logic exactly as is)
//       const existingUser = await prisma.user.findUnique({ where: { phone } });

//       if (existingUser) {
//         // Update existing user logic...
//         const updateData: any = {};
//         if (!existingUser.isPhoneVerified) updateData.isPhoneVerified = true;
//         if (name && !existingUser.name) updateData.name = name;

//         if (Object.keys(updateData).length > 0) {
//           user = await prisma.user.update({ where: { id: existingUser.id }, data: updateData });
//         } else {
//           user = existingUser;
//         }
//       } else {
//         // Create new user logic...
//         user = await prisma.user.create({
//           data: {
//             phone: phone,
//             name: name || "User",
//             isPhoneVerified: true,
//             role: "USER",
//           },
//         });
//       }
//     }

//     return NextResponse.json(user);

//   } catch (error: any) {
//     console.error("🔥 [API] Verify Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }