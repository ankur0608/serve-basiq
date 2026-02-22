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