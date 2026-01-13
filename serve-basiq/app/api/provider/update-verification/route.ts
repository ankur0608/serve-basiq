import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    console.log("\n================= 🔐 VERIFICATION SUBMIT START =================");

    try {
        const body = await req.json();
        const {
            userId, fullName, email, phone, gender, dob, preferredLanguage,
            addressLine1, addressLine2, landmark, city, state, pincode,
            shopName, bizAddressLine1, bizAddressLine2, bizCity, bizState, bizPincode,
            bankAccountHolder, bankAccountNumber, bankIfsc, bankName, upiId, preferredPayoutMethod,
            idProofType, idProofNumber, idProofFrontImg, idProofBackImg,
            businessProofImg, gstRegistered, gstNumber
        } = body;

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
        }

        // ✅ Robust Transaction with increased timeouts (30s)
        await prisma.$transaction(async (tx) => {
            console.log("⛓️ 1. Updating Core User Profile...");
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: fullName,
                    email,
                    phone,
                    shopName,
                    gender,
                    dob: dob ? new Date(dob) : null,
                    preferredLanguage,
                    bankAccountHolder,
                    bankAccountNumber,
                    bankIfsc,
                    bankName,
                    upiId,
                    preferredPayoutMethod,
                    isVerified: false,
                },
            });

            console.log("⛓️ 2. Upserting KYC Details...");
            await tx.kycDetails.upsert({
                where: { userId },
                create: {
                    userId,
                    idProofType: idProofType || "Aadhaar",
                    idProofNumber,
                    idProofFrontImg,
                    idProofBackImg,
                    businessProofImg,
                    gstRegistered: Boolean(gstRegistered),
                    gstNumber: gstNumber || null,
                    status: "PENDING",
                },
                update: {
                    idProofType: idProofType || "Aadhaar",
                    idProofNumber,
                    idProofFrontImg,
                    idProofBackImg,
                    businessProofImg,
                    gstRegistered: Boolean(gstRegistered),
                    gstNumber: gstNumber || null,
                    status: "PENDING",
                },
            });

            console.log("⛓️ 3. Standardizing Address Logic...");
            const homeData = { line1: addressLine1, line2: addressLine2 || "", landmark: landmark || "", city, state, pincode: String(pincode), country: "India" };
            const workData = { line1: bizAddressLine1, line2: bizAddressLine2 || "", city: bizCity, state: bizState, pincode: String(bizPincode), landmark: "", country: "India" };

            // Home Address Logic
            const existingHome = await tx.address.findFirst({ where: { userId, type: "Home" } });
            if (existingHome) {
                await tx.address.update({ where: { id: existingHome.id }, data: homeData });
            } else if (addressLine1) {
                await tx.address.create({ data: { ...homeData, userId, type: "Home" } });
            }

            // Work Address Logic
            const existingWork = await tx.address.findFirst({ where: { userId, type: "Work" } });
            if (existingWork) {
                await tx.address.update({ where: { id: existingWork.id }, data: workData });
            } else if (bizAddressLine1) {
                await tx.address.create({ data: { ...workData, userId, type: "Work" } });
            }

            console.log("🧾 Transaction completed successfully");
        }, {
            maxWait: 15000, // Wait 15s to acquire connection
            timeout: 30000  // Total 30s allowed for transaction
        });

        return NextResponse.json({ success: true, message: "Verification profile updated successfully" });

    } catch (error: any) {
        console.error("❌ VERIFICATION FAILED:", error.message);
        return NextResponse.json({
            success: false,
            message: "Failed to save verification data",
            error: error.message
        }, { status: 500 });
    }
}