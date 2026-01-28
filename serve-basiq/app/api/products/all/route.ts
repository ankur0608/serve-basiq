import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Get Category Filter from URL
    const { searchParams } = new URL(request.url);
    const catFilter = searchParams.get('cat');

    // 2. Build Base Where Clause (Verified Only)
    const whereClause: any = {
      isVerified: true,
      // user: { isVerified: true } // Optional: Uncomment if strict seller verification is needed
    };

    // 3. Handle Category Filtering (Parent OR Child logic)
    if (catFilter && catFilter !== 'All') {
      whereClause.OR = [
        // Case A: The product is directly in this category
        { category: { name: catFilter } },
        // Case B: The product is in a sub-category, and we are filtering by the Parent
        { category: { parent: { name: catFilter } } }
      ];
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
          select: {
            name: true,
            parent: { select: { name: true } } // Fetch parent name for context
          }
        }
      }
    });

    // 4. Transform data for frontend
    const formattedProducts = products.map(product => ({
      ...product,
      img: product.productImage,
      // If it's a subcategory, show "Parent > Child", otherwise just "Name"
      category: product.category?.parent
        ? `${product.category.parent.name} > ${product.category.name}`
        : product.category?.name || "General",
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