import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const catFilter = searchParams.get('cat');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100'); // Increased default limit

    // ✅ 1. REMOVED 'isVerified: true' so you can see all test data
    const whereClause: any = {};

    // Category Filter
    if (catFilter && catFilter !== 'All') {
      whereClause.OR = [
        { category: { name: catFilter } },
        { subcategory: { name: catFilter } } // Added subcategory search support
      ];
    }

    // Search Filter
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

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, shopName: true, name: true, isVerified: true, profileImage: true, image: true }
        },
        category: {
          select: { id: true, name: true }
        },
        subcategory: { // ✅ Added Subcategory Include
          select: { id: true, name: true }
        }
      }
    });

    // Formatting for Frontend
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.desc, // Frontend expects 'description', DB has 'desc'

      category: {
        id: product.category?.id,
        name: product.category?.name || "General"
      },
      subcategory: {
        id: product.subcategory?.id,
        name: product.subcategory?.name
      },

      price: Number(product.price) || 0,
      minOrderQty: Number(product.moq) || 1,
      unit: product.unit || "Pcs",

      // ✅ Fix Image Logic: Check gallery first, then single image
      images: product.gallery.length > 0
        ? product.gallery
        : (product.productImage ? [product.productImage] : []),

      // For fallback/legacy support if frontend expects single string
      image: product.productImage || (product.gallery.length > 0 ? product.gallery[0] : ""),

      provider: {
        id: product.user?.id,
        name: product.user?.name,
        shopName: product.user?.shopName || product.user?.name || "Seller",
        image: product.user?.profileImage || product.user?.image || "",
        verified: product.user?.isVerified || false
      },

      rating: 0, // Default if not in DB
      reviewsCount: 0,
      stock: 100 // Default to show as in-stock
    }));

    return NextResponse.json({ success: true, products: formattedProducts });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Error fetching products" }, { status: 500 });
  }
}