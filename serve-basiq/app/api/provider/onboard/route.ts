import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onboardSchema } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await req.json();

        const validData = onboardSchema.parse(body);

        if (validData.email) {
            const existingUser = await prisma.user.findFirst({
                where: { email: validData.email },
            });

            if (existingUser && existingUser.id !== userId) {
                return NextResponse.json(
                    { success: false, message: "This email is already in use by another account." },
                    { status: 409 }
                );
            }
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: validData.fullName,
                    email: validData.email,
                    phone: validData.phone,
                    profileImage: validData.profileImage,
                    shopName: validData.shopName,
                    isWorker: true,
                    isWebsite: false,
                },
            });

            const existingAddress = await tx.address.findFirst({
                where: { userId, type: "Work" }
            });

            const addressData = {
                line1: validData.addressLine1,
                line2: validData.addressLine2 || "",
                landmark: validData.landmark || "",
                city: validData.city,
                district: validData.district || "",
                state: validData.state,
                pincode: validData.pincode,
                country: "India",
                type: "Work"
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

        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return NextResponse.json(
                { success: false, message: "Email already taken by another account." },
                { status: 409 }
            );
        }

        if (error.issues) {
            return NextResponse.json({ success: false, error: "Validation Failed", details: error.issues }, { status: 400 });
        }

        return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
    }
}