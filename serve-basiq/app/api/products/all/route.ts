import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const catFilter = searchParams.get('cat');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build Where Clause
    const whereClause: any = {
      isVerified: true,
    };

    if (catFilter && catFilter !== 'All') {
      whereClause.OR = [
        { category: { name: catFilter } },
        { category: { parent: { name: catFilter } } }
      ];
    }

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
          select: { shopName: true, name: true, isVerified: true }
        },
        category: {
          select: { name: true }
        }
      }
    });

    // Formatting for Frontend
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category?.name || "General",
      price: Number(product.price) || 0,
      moq: Number(product.moq) || 1,
      unit: product.unit || "Pcs",
      // Prioritize images
      image: product.productImage || product.gallery?.[0] || "",
      supplier: product.user?.shopName || product.user?.name || "Verified Seller",
      isVerified: product.user?.isVerified || false
    }));

    return NextResponse.json({ success: true, products: formattedProducts });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Error" }, { status: 500 });
  }
}