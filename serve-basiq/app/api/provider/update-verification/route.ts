import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    console.log("\n================= 🔐 VERIFICATION SUBMIT START (3-STEP) =================");

    try {
        const body = await req.json();

        // 🔍 LOG: See exactly what the frontend is sending
        console.log("📥 RECEIVED BODY:", JSON.stringify(body, null, 2));

        const {
            userId,
            providerType,
            fullName, email, phone, gender, dob, preferredLanguage,
            addressLine1, addressLine2, landmark, city, state, pincode,
            shopName, bizAddressLine1, bizAddressLine2, bizCity, bizState, bizPincode,
            instagramUrl, facebookUrl, youtubeUrl, websiteUrl,
            idProofType, idProofNumber, idProofImg, gstRegistered, gstNumber
        } = body;

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 });
        }

        const validDob = dob && dob !== "" ? new Date(dob) : null;

        await prisma.$transaction(async (tx) => {

            console.log("📝 UPDATING USER:", {
                userId,
                name: fullName,
                dob: validDob,
                language: preferredLanguage
            });

            console.log("⛓️ 1. Updating Core User Profile...");
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: fullName,
                    email,
                    phone,
                    providerType: providerType || "BOTH",
                    shopName,
                    gender,
                    dob: validDob, 
                    preferredLanguage: preferredLanguage || "English", 
                    instagramUrl,
                    facebookUrl,
                    youtubeUrl,
                    websiteUrl,
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
                    idProofFrontImg: idProofImg,
                    idProofBackImg: null,
                    businessProofImg: null,
                    gstRegistered: Boolean(gstRegistered),
                    gstNumber: gstNumber || null,
                    status: "PENDING",
                },
                update: {
                    idProofType: idProofType || "Aadhaar",
                    idProofNumber,
                    idProofFrontImg: idProofImg,
                    idProofBackImg: null,
                    businessProofImg: null,
                    gstRegistered: Boolean(gstRegistered),
                    gstNumber: gstNumber || null,
                    status: "PENDING",
                },
            });

            console.log("⛓️ 3. Standardizing Address Logic...");

            const homeData = {
                line1: addressLine1,
                line2: addressLine2 || "",
                landmark: landmark || "",
                city,
                state: state || "",
                pincode: String(pincode),
                country: "India"
            };

            const workData = {
                line1: bizAddressLine1,
                line2: bizAddressLine2 || "",
                city: bizCity,
                state: bizState || "",
                pincode: String(bizPincode),
                landmark: "",
                country: "India"
            };

            const existingHome = await tx.address.findFirst({ where: { userId, type: "Home" } });
            if (existingHome) {
                await tx.address.update({ where: { id: existingHome.id }, data: homeData });
            } else if (addressLine1) {
                await tx.address.create({ data: { ...homeData, userId, type: "Home" } });
            }

            const existingWork = await tx.address.findFirst({ where: { userId, type: "Work" } });
            if (existingWork) {
                await tx.address.update({ where: { id: existingWork.id }, data: workData });
            } else if (bizAddressLine1) {
                await tx.address.create({ data: { ...workData, userId, type: "Work" } });
            }

            console.log("🧾 Transaction completed successfully");
        }, {
            maxWait: 15000,
            timeout: 30000
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