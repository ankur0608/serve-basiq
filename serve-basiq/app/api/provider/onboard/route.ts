import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onboardSchema } from "@/lib/validators";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📦 Onboard Payload:", body);

        // 1. Validate payload
        const validData = onboardSchema.parse(body);
        const { userId, providerType } = body;

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        // 2. Check for existing email safely (Using findFirst avoids crashes if @unique is missing in schema)
        if (validData.email) {
            const existingUser = await prisma.user.findFirst({
                where: { email: validData.email },
            });

            if (existingUser && existingUser.id !== userId) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "This email is already in use by another account. Please use a different email."
                    },
                    { status: 409 } // 409 Conflict
                );
            }
        }

        // 3. Database Transaction
        await prisma.$transaction(async (tx) => {
            // Update User Profile
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: validData.fullName,
                    email: validData.email,
                    phone: validData.phone,
                    profileImage: validData.profileImage,

                    gender: validData.gender,
                    dob: validData.dob ? new Date(validData.dob) : null,
                    preferredLanguage: validData.preferredLanguage,

                    providerType: providerType || "BOTH",

                    isWorker: true,
                    isWebsite: false,
                },
            });

            // Handle Address
            const existingAddress = await tx.address.findFirst({
                where: { userId, type: "Home" }
            });

            const addressData = {
                line1: validData.addressLine1,
                line2: validData.addressLine2 || "",
                landmark: validData.landmark || "",
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

        // Handle Prisma Unique Constraint Violation
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return NextResponse.json(
                { success: false, message: "Email already taken by another account." },
                { status: 409 }
            );
        }

        // Handle Zod Validation Errors
        if (error.issues) {
            return NextResponse.json({ success: false, error: "Validation Failed", details: error.issues }, { status: 400 });
        }

        // 👉 CHANGED: Return 500 for database timeouts or internal crashes, not 400!
        return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
    }
}