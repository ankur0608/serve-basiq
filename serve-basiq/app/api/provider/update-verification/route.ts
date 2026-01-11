import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 🔍 LOG: Check what the frontend actually sent
        console.log("📦 Payload Data Received:", body);

        const {
            userId,
            // Separate Address Fields
            addressLine1, city, state, pincode,
            // Separate Business Address Fields
            bizAddressLine1, bizCity, bizState, bizPincode,

            // ✅ Key Fix: Extract 'shopName' correctly
            shopName,

            // Separate Personal Fields
            fullName, email, phone,
            // The rest are Bank/KYC fields
            ...kycData
        } = body;

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        // We use a Transaction to ensure ALL data saves, or NONE of it does.
        await prisma.$transaction(async (tx) => {

            // 1. Update User Table (Bank, KYC, Basic Info, AND Shop Name)
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: fullName,
                    email: email,
                    phone: phone,

                    // ✅ SAVE SHOP NAME HERE
                    shopName: shopName,

                    // Save KYC & Bank Data
                    ...kycData,

                    verificationStatus: "SUBMITTED",
                },
            });

            // 2. Handle HOME Address
            const homeAddress = await tx.address.findFirst({
                where: { userId, type: "Home" }
            });

            if (homeAddress) {
                await tx.address.update({
                    where: { id: homeAddress.id },
                    data: { line1: addressLine1, city, state, pincode }
                });
            } else {
                if (addressLine1) {
                    await tx.address.create({
                        data: { userId, type: "Home", line1: addressLine1, city, state, pincode, line2: "" }
                    });
                }
            }

            // 3. Handle BUSINESS (Work) Address
            const workAddress = await tx.address.findFirst({
                where: { userId, type: "Work" }
            });

            if (workAddress) {
                await tx.address.update({
                    where: { id: workAddress.id },
                    data: {
                        line1: bizAddressLine1,
                        // You can store shopName here too if you want redundancy, but storing it in User is better
                        line2: shopName || "",
                        city: bizCity,
                        state: bizState,
                        pincode: bizPincode
                    }
                });
            } else {
                if (bizAddressLine1) {
                    await tx.address.create({
                        data: {
                            userId,
                            type: "Work",
                            line1: bizAddressLine1,
                            line2: shopName || "",
                            city: bizCity,
                            state: bizState,
                            pincode: bizPincode
                        }
                    });
                }
            }
        });

        console.log("✅ [Verification API] Successfully updated user profile & shop details");
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("❌ [Verification API] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}