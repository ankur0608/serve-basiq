import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const { bookingId, status } = await req.json();

        // ✅ Updated Valid Statuses based on your new Schema
        const validStatuses = [
            'REQUESTED',
            'ACCEPTED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED'
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json({
                success: false,
                message: `Invalid status. Allowed: ${validStatuses.join(", ")}`
            }, { status: 400 });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status },
        });

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error("Update Status Error:", error);
        return NextResponse.json({ success: false, message: "Error updating booking" }, { status: 500 });
    }
}