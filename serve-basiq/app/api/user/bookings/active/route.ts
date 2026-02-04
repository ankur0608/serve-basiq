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

        // Fetch non-cancelled Bookings (Services)
        const bookings = await prisma.booking.findMany({
            where: {
                userId: user.id,
                status: { not: "CANCELLED" }
            },
            include: {
                service: true,
                address: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch non-cancelled Orders (Products)
        const orders = await prisma.order.findMany({
            where: {
                userId: user.id,
                status: { not: "CANCELLED" }
            },
            include: {
                product: true,
                address: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Combine them into a single list
        const combined = [
            ...bookings.map(b => ({ ...b, type: 'SERVICE' })),
            ...orders.map(o => ({ ...o, type: 'PRODUCT' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(combined);
    } catch (error) {
        console.error("ACTIVE_BOOKINGS_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}