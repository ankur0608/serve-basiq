import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        const [serviceBookings, rentalBookings, orders] = await Promise.all([
            prisma.booking.findMany({
                where: { service: { userId } },
                include: {
                    user: { select: { name: true, image: true, profileImage: true, phone: true } },
                    service: { select: { name: true, price: true, priceType: true } },
                    address: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.rentalBooking.findMany({
                where: { rental: { userId } },
                include: {
                    user: { select: { name: true, image: true, profileImage: true, phone: true } },
                    rental: { select: { name: true, price: true, priceType: true } },
                    address: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.order.findMany({
                where: { product: { userId } },
                include: {
                    user: { select: { name: true, image: true, profileImage: true, phone: true } },
                    product: { select: { name: true, price: true, deliveryType: true } },
                    address: true
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const bookings = [...serviceBookings, ...rentalBookings].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ success: true, bookings, orders });

    } catch (error) {
        console.error("Requests API Error:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}