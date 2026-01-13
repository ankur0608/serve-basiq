import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onboardSchema } from "@/lib/validators";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // 🔍 Log for debugging
        console.log("📦 Onboard Payload:", body);

        // 1. Validate Data using Zod
        const validData = onboardSchema.parse(body);
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // 2. Update User Profile
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: validData.fullName,
                    email: validData.email,
                    phone: validData.phone, // ✅ Mapped correctly

                    // ✅ Updated to match new Schema field
                    profileImage: validData.profileImage,

                    // ✅ New Personal Fields
                    gender: validData.gender,
                    dob: validData.dob ? new Date(validData.dob) : null,
                    preferredLanguage: validData.preferredLanguage,

                    // Flags
                    isWorker: true,
                    isWebsite: false,
                },
            });

            // 3. Create or Update Home Address
            // Check if a Home address already exists to prevent duplicates
            const existingAddress = await tx.address.findFirst({
                where: { userId, type: "Home" }
            });

            const addressData = {
                line1: validData.addressLine1,
                line2: validData.addressLine2 || "",
                landmark: validData.landmark || "", // ✅ Added Landmark
                city: validData.city,
                state: validData.state,
                pincode: validData.pincode,
                country: "India",
                type: "Home"
            };

            if (existingAddress) {
                await tx.address.update({
                    where: { id: existingAddress.id },
                    data: addressData
                });
            } else {
                await tx.address.create({
                    data: {
                        userId,
                        ...addressData
                    },
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("❌ Onboard Error:", error);

        // Return Zod validation errors clearly
        if (error.issues) {
            return NextResponse.json({ success: false, error: "Validation Failed", details: error.issues }, { status: 400 });
        }

        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}