import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const type = searchParams.get("type");

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        let bookings: any[] = [];
        let orders: any[] = [];

        if (type !== 'PRODUCT') {
            const serviceBookings = await prisma.booking.findMany({
                where: {
                    service: { userId: userId }
                },
                include: {
                    user: { select: { name: true, image: true, profileImage: true, phone: true } },
                    service: { select: { name: true, price: true } },
                    address: true
                },
                orderBy: { createdAt: 'desc' }
            });

            const rentalBookings = await prisma.rentalBooking.findMany({
                where: {
                    rental: { userId: userId } 
                },
                include: {
                    user: { select: { name: true, image: true, profileImage: true, phone: true } },
                    rental: { select: { name: true, price: true } }, 
                    address: true
                },
                orderBy: { createdAt: 'desc' }
            });

            bookings = [...serviceBookings, ...rentalBookings];

            bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        if (type !== 'SERVICE') {
            orders = await prisma.order.findMany({
                where: {
                    product: { userId: userId }
                },
                include: {
                    user: { select: { name: true, image: true, profileImage: true, phone: true } },
                    product: { select: { name: true, price: true, deliveryType: true } },
                    address: true
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json({ success: true, bookings, orders });

    } catch (error) {
        console.error("Requests API Error:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}