import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
    try {
        const { userId, serviceId } = await req.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        let result;

        if (serviceId) {
            // Delete specific service
            // ✅ FIX: 'id' is a String (UUID), so we removed Number() conversion
            result = await prisma.service.deleteMany({
                where: {
                    id: serviceId,
                    userId: userId // Security: Ensure user owns the service
                }
            });
        } else {
            // Delete ALL services for this user
            result = await prisma.service.deleteMany({
                where: { userId: userId },
            });
        }

        return NextResponse.json({
            success: true,
            message: "Service(s) deleted successfully",
            count: result.count
        });

    } catch (error: any) {
        console.error("Delete API Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Server Error" }, { status: 500 });
    }
}