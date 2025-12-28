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
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        user: { select: { name: true, isVerified: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formatted = {
      ...product,
      supplier: product.user?.name || "Verified Seller",
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
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    console.log("📝 Received Payload:", body);

    // 🔴 CRITICAL FIX: Destructure ONLY the fields that exist in the Product model.
    // We explicitly exclude 'id', 'userId', and any banking fields that don't belong here.
    const {
      name,
      cat,
      price,
      moq,
      desc,
      img,
      gallery,
      // If you add banking fields to Prisma schema later, add them here too.
    } = body;

    // Create a sanitized object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (cat !== undefined) updateData.cat = cat;
    if (price !== undefined) updateData.price = parseFloat(price); // Ensure number
    if (moq !== undefined) updateData.moq = moq;
    if (desc !== undefined) updateData.desc = desc;
    if (img !== undefined) updateData.img = img;
    if (gallery !== undefined) updateData.gallery = gallery;

    console.log("✅ Sanitized Update Data:", updateData);

    const updated = await prisma.product.update({
      where: { id: productId },
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
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: productId },
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