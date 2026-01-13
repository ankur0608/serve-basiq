import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =======================
// 🔹 GET PRODUCT BY ID
// =======================
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ❌ REMOVED: const productId = parseInt(id); (IDs are strings now)

    const product = await prisma.product.findUnique({
      where: { id }, // Uses string UUID directly
      include: {
        user: {
          select: {
            name: true,
            shopName: true,
            isVerified: true,
            profileImage: true
          }
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formatted = {
      ...product,
      // Map for frontend consistency
      img: product.productImage,
      supplier: product.user?.shopName || product.user?.name || "Verified Seller",
      supplierImg: product.user?.profileImage,
      isVerified: product.user?.isVerified || false,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("❌ GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// =======================
// 🔹 UPDATE PRODUCT (PATCH)
// =======================
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ❌ REMOVED: parseInt check. UUIDs are strings.

    const body = await req.json();
    console.log("📝 Received Update Payload:", body);

    // Destructure strictly what the Prisma Model allows
    const {
      name,
      category, // Was 'cat'
      price,
      moq,
      desc,
      productImage, // Was 'img'
      gallery,
      stockStatus,
      unit,
      deliveryType
    } = body;

    // Create a sanitized update object
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (desc !== undefined) updateData.desc = desc;
    if (productImage !== undefined) updateData.productImage = productImage;
    if (gallery !== undefined) updateData.gallery = gallery;

    // Numbers
    if (price !== undefined) updateData.price = parseFloat(price);
    if (moq !== undefined) updateData.moq = parseInt(moq); // ✅ Ensure Int

    // Enums
    if (stockStatus !== undefined) updateData.stockStatus = stockStatus;
    if (unit !== undefined) updateData.unit = unit;
    if (deliveryType !== undefined) updateData.deliveryType = deliveryType;

    console.log("✅ Sanitized Update Data:", updateData);

    const updated = await prisma.product.update({
      where: { id }, // UUID String
      data: updateData,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("❌ PATCH Error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// =======================
// 🔹 DELETE PRODUCT
// =======================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ❌ REMOVED: parseInt check

    await prisma.product.delete({
      where: { id }, // UUID String
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ DELETE Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}