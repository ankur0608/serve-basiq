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

        // 1. Fetch Cancelled Service Bookings
        const cancelledServices = await prisma.booking.findMany({
            where: {
                userId: user.id,
                status: "CANCELLED"
            },
            include: {
                service: true,
                address: true
            }
        });

        // 2. Fetch Cancelled Product Orders
        const cancelledProducts = await prisma.order.findMany({
            where: {
                userId: user.id,
                status: "CANCELLED"
            },
            include: {
                product: true,
                address: true
            }
        });

        // 3. Combine and sort by date (newest first)
        const allCancellations = [
            ...cancelledServices.map(b => ({ ...b, type: 'SERVICE' })),
            ...cancelledProducts.map(o => ({ ...o, type: 'PRODUCT' }))
        ].sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        return NextResponse.json(allCancellations);
    } catch (error) {
        console.error("CANCELLATIONS_FETCH_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}