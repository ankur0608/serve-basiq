import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // --- PAGINATION PARAMS ---
    const limit = parseInt(searchParams.get('limit') || '12');
    const cursor = searchParams.get('cursor');

    // --- FILTER PARAMS ---
    const catFilter = searchParams.get('cat');
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');
    const search = searchParams.get('search');

    const whereClause: any = {
      isVerified: true,
      user: { isVerified: true }
    };

    // 1. ID-Based Filters
    if (categoryId) whereClause.categoryId = categoryId;
    if (subcategoryId) whereClause.subCategoryId = subcategoryId;

    // 2. Legacy Name-Based Filter
    if (!categoryId && catFilter && catFilter !== 'All') {
      whereClause.OR = [
        { category: { name: catFilter } },
        { subcategory: { name: catFilter } }
      ];
    }

    // 3. Search Filter
    if (search) {
      const searchCondition = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { desc: { contains: search, mode: 'insensitive' } },
        ]
      };

      if (whereClause.AND) {
        // @ts-ignore
        whereClause.AND.push(searchCondition);
      } else {
        whereClause.AND = [searchCondition];
      }
    }

    // --- DB QUERY ---
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        user: {
          select: { id: true, shopName: true, name: true, isVerified: true, profileImage: true, image: true }
        },
        category: {
          select: { id: true, name: true }
        },
        subcategory: {
          select: { id: true, name: true }
        },
        _count: {
          select: { reviews: true }
        }
      }
    });

    // --- CURSOR LOGIC ---
    let nextCursor = undefined;
    if (products.length > limit) {
      const nextItem = products.pop();
      nextCursor = nextItem?.id; // Last item ID
    }

    // --- FORMATTING ---
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.desc,

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

      // Image Logic
      images: product.gallery.length > 0
        ? product.gallery
        : (product.productImage ? [product.productImage] : []),

      // Fallback Image
      image: product.productImage || (product.gallery.length > 0 ? product.gallery[0] : ""),

      provider: {
        id: product.user?.id,
        name: product.user?.name,
        shopName: product.user?.shopName || product.user?.name || "Seller",
        image: product.user?.profileImage || product.user?.image || "",
        verified: product.user?.isVerified || false
      },

      // ✅ FIX: Hardcode to 0 because 'rating' field does not exist in DB yet
      rating: 0,

      reviewsCount: product._count?.reviews || 0,
      stock: 100
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      nextCursor
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, message: "Error fetching products" }, { status: 500 });
  }
}