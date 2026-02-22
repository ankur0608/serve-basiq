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

        const bookings = await prisma.booking.findMany({
            where: {
                userId: user.id,
                status: { not: "CANCELLED" }
            },
            include: {
                service: {
                    include: { user: true } 
                },
                address: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const orders = await prisma.order.findMany({
            where: {
                userId: user.id,
                status: { not: "CANCELLED" }
            },
            include: {
                product: {
                    include: { user: true } 
                },
                address: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const rentals = await prisma.rentalBooking.findMany({
            where: {
                userId: user.id,
                status: { not: "CANCELLED" }
            },
            include: {
                rental: {
                    include: { user: true } 
                },
            },
            orderBy: { createdAt: 'desc' }
        });

        const combined = [
            ...bookings.map((b: any) => ({
                ...b,
                type: 'SERVICE',
                title: b.service?.name || "Service",
                image: b.service?.images?.[0] || b.service?.image,
                price: b.totalPrice || b.price,
                bookingOwner: b.service?.user
            })),
            ...orders.map((o: any) => ({
                ...o,
                type: 'PRODUCT',
                title: o.product?.name || "Product",
                image: o.product?.images?.[0] || o.product?.image,
                price: o.totalPrice,
                bookingOwner: o.product?.user 
            })),
            ...rentals.map((r: any) => ({
                ...r,
                type: 'RENTAL',
                title: r.rental?.name || "Rental",
                image: r.rental?.images?.[0] || r.rental?.image,
                price: r.totalPrice,
                bookingOwner: r.rental?.user 
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(combined);
    } catch (error) {
        console.error("ACTIVE_BOOKINGS_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}