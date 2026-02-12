import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function PATCH(req: Request) {
    try {
        const { bookingId, status } = await req.json();

        if (!bookingId || !status) {
            return NextResponse.json({ success: false, message: "Missing ID or status" }, { status: 400 });
        }

        // ✅ Unified Valid Statuses (Same for both)
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

        // Update the Booking
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: status as BookingStatus
            },
            include: {
                service: true,
                rental: true,
                user: true
            }
        });

        return NextResponse.json({ success: true, data: updatedBooking });

    } catch (error) {
        console.error("Update Status Error:", error);
        return NextResponse.json({ success: false, message: "Error updating booking" }, { status: 500 });
    }
}