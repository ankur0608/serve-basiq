import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onboardSchema } from "@/lib/validators";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate Data
        const validData = onboardSchema.parse(body);
        const { userId } = body;

        // Transaction: Update User, Create Address, Create Skeleton Service with Location
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

            // 3. Create Skeleton Service with Lat/Lng
            const existingService = await tx.service.findUnique({ where: { userId } });

            if (!existingService) {
                await tx.service.create({
                    data: {
                        userId: userId,
                        name: validData.fullName,
                        desc: "New Service Provider",
                        img: validData.img,
                        altPhone: validData.altPhone,

                        // ✅ SAVE LOCATION HERE
                        latitude: validData.latitude || 0,
                        longitude: validData.longitude || 0,

                        // Also save address fields to Service for backup/search
                        addressLine1: validData.addressLine1,
                        city: validData.city,
                        state: validData.state,
                        pincode: validData.pincode,
                    },
                });
            } else {
                // Optional: Update existing service if they came back
                await tx.service.update({
                    where: { userId },
                    data: {
                        latitude: validData.latitude || existingService.latitude,
                        longitude: validData.longitude || existingService.longitude,
                    }
                })
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Onboard Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}