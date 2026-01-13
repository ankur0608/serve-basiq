import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const { bookingId, status } = await req.json();

        if (!['CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
            return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status },
        });

        return NextResponse.json({ success: true, booking: updatedBooking });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error updating booking" }, { status: 500 });
    }
}