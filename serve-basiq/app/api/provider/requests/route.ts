import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const type = searchParams.get("type"); // 'SERVICE', 'PRODUCT', or 'BOTH'

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        // ✅ FIX: Explicitly type arrays to avoid "implicitly has type any[]" error
        let bookings: any[] = [];
        let orders: any[] = [];

        // 1. Fetch Service & Rental Bookings (If type is SERVICE or BOTH)
        if (type !== 'PRODUCT') {
            // A. Service Bookings
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

            // B. Rental Bookings (✅ NEW: Added Rental Request Logic)
            const rentalBookings = await prisma.rentalBooking.findMany({
                where: {
                    rental: { userId: userId } // Fetch rentals owned by provider
                },
                include: {
                    user: { select: { name: true, image: true, profileImage: true, phone: true } },
                    rental: { select: { name: true, price: true } }, // Get rental details
                    address: true
                },
                orderBy: { createdAt: 'desc' }
            });

            // Merge both into the bookings array
            bookings = [...serviceBookings, ...rentalBookings];

            // Sort combined array by date desc
            bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        // 2. Fetch Product Orders (If type is PRODUCT or BOTH)
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