import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Unwrap params (Next.js 15)
    const { id } = await params;
    const productId = parseInt(id);

    console.log(`🔍 API HIT: Fetching Product ID: ${productId}`); // ✅ Debug Log

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 2. Find in DB
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        user: { 
          select: { name: true, isVerified: true } 
        }
      }
    });

    if (!product) {
      console.log(`❌ API: Product ID ${productId} NOT FOUND in Database`); // ✅ Debug Log
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 3. Format Data (Flatten supplier info)
    const formattedProduct = {
      ...product,
      supplier: product.user?.name || "Verified Seller",
      isVerified: product.user?.isVerified || false
    };

    console.log(`✅ API: Successfully returned Product ID ${productId}`); // ✅ Debug Log
    return NextResponse.json(formattedProduct);

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}