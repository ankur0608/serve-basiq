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
            activeBookings,
            activeOrders,
            cancelledBookings,
            cancelledOrders
        ] = await Promise.all([
            prisma.booking.count({ where: { userId, status: { not: "CANCELLED" } } }),
            prisma.order.count({ where: { userId, status: { not: "CANCELLED" } } }),
            prisma.booking.count({ where: { userId, status: "CANCELLED" } }),
            prisma.order.count({ where: { userId, status: "CANCELLED" } })
        ]);

        return NextResponse.json({
            bookings: activeBookings + activeOrders,
            cancellations: cancelledBookings + cancelledOrders,
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}