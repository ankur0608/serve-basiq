import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Ensure it doesn't cache stale data

export async function GET() {
  try {
    console.log("🔥 Fetching all products...");

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }, // Newest first
      include: {
        user: {
          select: { name: true, isVerified: true } // ✅ Fetch Supplier Name
        }
      }
    });

    // Transform data to match frontend expectations (flatten user.name -> supplier)
    const formattedProducts = products.map(product => ({
      ...product,
      supplier: product.user?.name || "Verified Seller", // Fallback if name missing
      isVerified: product.user?.isVerified || false
    }));
    
    console.log(`✅ Found ${products.length} products`);
    return NextResponse.json(formattedProducts);

  } catch (error) {
    console.error("❌ Get Products Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}