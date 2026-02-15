import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = user.id;

        const [
            activeBookings, // Services
            activeOrders,   // Products
            activeRentals,  // ✅ RENTALS (New)
            cancelledBookings,
            cancelledOrders,
            cancelledRentals // ✅ CANCELLED RENTALS (New)
        ] = await Promise.all([
            // Count Active
            prisma.booking.count({ where: { userId, status: { not: "CANCELLED" } } }),
            prisma.order.count({ where: { userId, status: { not: "CANCELLED" } } }),
            prisma.rentalBooking.count({ where: { userId, status: { not: "CANCELLED" } } }), // ✅ Add this

            // Count Cancelled
            prisma.booking.count({ where: { userId, status: "CANCELLED" } }),
            prisma.order.count({ where: { userId, status: "CANCELLED" } }),
            prisma.rentalBooking.count({ where: { userId, status: "CANCELLED" } }) // ✅ Add this
        ]);

        return NextResponse.json({
            // Sum up ALL three types
            bookings: activeBookings + activeOrders + activeRentals,
            cancellations: cancelledBookings + cancelledOrders + cancelledRentals,
        });
    } catch (error) {
        console.error("STATS_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}