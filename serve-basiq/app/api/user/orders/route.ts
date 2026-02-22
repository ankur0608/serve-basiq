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

        const orders = await prisma.order.findMany({
            where: {
                userId: user.id,
            },
            include: {
                product: {
                    include: { user: true } 
                },
                address: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedOrders = orders.map((o: any) => ({
            ...o,
            type: 'PRODUCT',
            title: o.product?.name || "Product",
            image: o.product?.images?.[0] || o.product?.image || o.product?.productImage,
            price: o.totalPrice,
            bookingOwner: o.product?.user
        }));

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error("ORDERS_FETCH_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}