import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Ensure it doesn't cache stale data

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        // ✅ 1. The Product itself must be verified by Admin
        isVerified: true,

        // ✅ 2. The Seller (User) must also be verified
        user: {
          isVerified: true
        }
      },
      orderBy: { createdAt: 'desc' }, // Newest first
      include: {
        user: {
          select: { name: true, isVerified: true, img: true } // Fetch Supplier details
        }
      }
    });

    // Transform data for frontend
    const formattedProducts = products.map(product => ({
      ...product,
      supplier: product.user?.name || "Verified Seller",
      supplierImg: product.user?.img,
      // This will always be true now because of the filter, but good to keep
      isVerified: product.isVerified
    }));

    return NextResponse.json(formattedProducts);

  } catch (error) {
    console.error("❌ Get Products Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}