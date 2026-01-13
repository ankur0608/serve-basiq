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
          select: {
            name: true,
            shopName: true, // ✅ Useful for products/B2B context
            isVerified: true,
            profileImage: true // ✅ Correct field name from User Model
          }
        }
      }
    });

    // Transform data for frontend
    const formattedProducts = products.map(product => ({
      ...product,

      // ✅ Map DB 'productImage' to 'img' for easier frontend usage if needed
      img: product.productImage,

      // ✅ Ensure new fields are explicitly passed (though ...product does this, explicit is safer)
      category: product.category,
      moq: product.moq,
      unit: product.unit,
      stockStatus: product.stockStatus,
      deliveryType: product.deliveryType,

      // ✅ Supplier Details
      supplier: product.user?.shopName || product.user?.name || "Verified Seller",
      supplierImg: product.user?.profileImage || "",
    }));

    // ✅ Return standardized response format
    return NextResponse.json({
      success: true,
      products: formattedProducts
    });

  } catch (error) {
    console.error("❌ Get Products Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }
}