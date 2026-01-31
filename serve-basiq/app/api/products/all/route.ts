import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Filter Parameters
    const catFilter = searchParams.get('cat');
    const search = searchParams.get('search');

    // 2. Pagination Parameters (Default: Page 1, 20 items per page)
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // 3. Build Where Clause
    const whereClause: any = {
      isVerified: true, // Only show verified products
    };

    // Category Filter (Parent OR Child)
    if (catFilter && catFilter !== 'All') {
      whereClause.OR = [
        { category: { name: catFilter } },
        { category: { parent: { name: catFilter } } }
      ];
    }

    // Optional: Search Text Filter
    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { desc: { contains: search, mode: 'insensitive' } },
          ]
        }
      ];
    }

    // 4. Fetch Products with Pagination
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit, // ✅ Limit results for speed
      skip: skip,  // ✅ Skip logic for pagination
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
            parent: { select: { name: true } }
          }
        }
      }
    });

    // 5. Transform Data
    const formattedProducts = products.map(product => ({
      ...product,
      img: product.productImage, // Map for frontend
      // Breadcrumb category logic
      category: product.category?.parent
        ? `${product.category.parent.name} > ${product.category.name}`
        : product.category?.name || "General",
      // Supplier Fallback Logic
      supplier: product.user?.shopName || product.user?.name || "Verified Seller",
      supplierImg: product.user?.profileImage || product.user?.image || "",
    }));

    // 6. Return Data (with pagination meta if needed)
    return NextResponse.json({
      success: true,
      products: formattedProducts,
      pagination: {
        page,
        limit,
        count: formattedProducts.length
      }
    });

  } catch (error) {
    console.error("❌ Get Products Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }
}