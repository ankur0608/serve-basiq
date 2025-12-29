import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ FIX: Change function name from POST to DELETE to match the frontend request
export async function DELETE(req: Request) {
    try {
        const { userId, serviceId } = await req.json();

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        let result;

        if (serviceId) {
            // Delete specific service
            result = await prisma.service.deleteMany({
                where: {
                    id: Number(serviceId),
                    userId: userId
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