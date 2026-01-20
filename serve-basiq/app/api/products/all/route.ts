import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // ✅ 1. Get Category Filter from URL
    const { searchParams } = new URL(request.url);
    const catFilter = searchParams.get('cat');

    // ✅ 2. Build Where Clause
    const whereClause: any = {
      isVerified: true,
      user: { isVerified: true }
    };

    // If a specific category is requested, filter by Category Name
    if (catFilter && catFilter !== 'All') {
      whereClause.category = {
        name: catFilter
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            shopName: true,
            isVerified: true,
            profileImage: true,
            image: true
          }
        },
        category: {
          select: { name: true }
        }
      }
    });

    // Transform data
    const formattedProducts = products.map(product => ({
      ...product,
      img: product.productImage,
      category: product.category?.name || "General",
      supplier: product.user?.shopName || product.user?.name || "Verified Seller",
      supplierImg: product.user?.profileImage || product.user?.image || "",
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts
    });

  } catch (error) {
    console.error("❌ Get Products Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }
}