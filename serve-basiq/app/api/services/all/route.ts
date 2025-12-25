import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Ensure real-time data

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, isVerified: true }
                }
            }
        });

        // Transform data to make it easier for the frontend
        const formattedProducts = products.map(product => ({
            ...product,
            supplier: product.user?.name || "Verified Seller",
            isVerified: product.user?.isVerified || false
        }));

        return NextResponse.json(formattedProducts);

    } catch (error) {
        console.error("❌ API Error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}