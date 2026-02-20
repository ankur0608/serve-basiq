import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // --- PAGINATION PARAMS ---
    const limit = parseInt(searchParams.get('limit') || '24');
    const cursor = searchParams.get('cursor');

    // --- FILTER PARAMS ---
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const sort = searchParams.get('sort');

    // --- BUILD PRISMA WHERE CLAUSE ---
    // 🔒 STRICT REQUIREMENT: Only verified products from verified users
    const whereClause: any = {
      isVerified: true,
      user: { isVerified: true }
    };

    if (categoryId) whereClause.categoryId = categoryId;
    if (subcategoryId) whereClause.subCategoryId = subcategoryId;

    // ✅ LOCATION FILTER: Look inside the User's Address table for "Work"
    if (location) {
      whereClause.user = {
        ...whereClause.user, // Keep the isVerified check!
        addresses: {
          some: {
            type: { equals: 'Work', mode: 'insensitive' },
            city: { equals: location, mode: 'insensitive' }
          }
        }
      };
    }

    // Search Filter
    if (search) {
      const searchCondition = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { desc: { contains: search, mode: 'insensitive' } },
        ]
      };

      if (whereClause.AND) {
        whereClause.AND.push(searchCondition);
      } else {
        whereClause.AND = [searchCondition];
      }
    }

    // --- BUILD PRISMA ORDER BY CLAUSE ---
    let orderBy: any = { createdAt: 'desc' };

    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "popular":
        orderBy = { reviews: { _count: "desc" } };
        break;
      // Note: Since 'rating' doesn't exist on Product schema yet, we skip sorting by it
    }

    // --- DB QUERY ---
    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        user: {
          select: {
            id: true, shopName: true, name: true, isVerified: true, profileImage: true, image: true,
            // ✅ Pull the Work address so the frontend can display the location!
            addresses: {
              where: { type: 'Work' },
              select: { city: true }
            }
          }
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
      nextCursor = nextItem?.id;
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
      images: product.gallery.length > 0
        ? product.gallery
        : (product.productImage ? [product.productImage] : []),
      image: product.productImage || (product.gallery.length > 0 ? product.gallery[0] : ""),

      // ✅ Map the city dynamically from the user's work address
      location: product.user?.addresses?.[0]?.city || "Worldwide",

      provider: {
        id: product.user?.id,
        name: product.user?.name,
        shopName: product.user?.shopName || product.user?.name || "Seller",
        image: product.user?.profileImage || product.user?.image || "",
        verified: product.user?.isVerified || false
      },
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