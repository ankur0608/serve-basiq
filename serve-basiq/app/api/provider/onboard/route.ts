import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onboardSchema } from "@/lib/validators";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate Data
        const validData = onboardSchema.parse(body);
        const { userId } = body;

        await prisma.$transaction(async (tx) => {
            // 1. Update User Profile
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: validData.fullName,
                    email: validData.email,
                    img: validData.img,
                    isWorker: true,
                    isWebsite: false,
                },
            });

            // 2. Create Address
            await tx.address.create({
                data: {
                    userId: userId,
                    line1: validData.addressLine1,
                    line2: validData.addressLine2 || "",
                    city: validData.city,
                    state: validData.state,
                    pincode: validData.pincode,
                },
            });

            // ❌ REMOVED: The logic that automatically created a service.
            // Now, the user will finish onboarding, but have 0 services.
            // They must click "Create New Service" in the dashboard manually.
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Onboard Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}