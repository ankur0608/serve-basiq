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
                // You can filter out cancelled if you want, but typically "My Orders" shows everything
            },
            include: {
                product: {
                    include: { user: true } // ✅ Fetch Seller details
                },
                address: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // ✅ Normalize Data for ActivityTabs
        const formattedOrders = orders.map((o: any) => ({
            ...o,
            type: 'PRODUCT',
            title: o.product?.name || "Product",
            image: o.product?.images?.[0] || o.product?.image || o.product?.productImage,
            price: o.totalPrice,
            // ✅ Standardized Owner (Seller)
            bookingOwner: o.product?.user
        }));

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error("ORDERS_FETCH_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}