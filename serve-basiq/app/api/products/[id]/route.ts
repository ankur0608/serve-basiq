import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;


    const product = await prisma.product.findUnique({
      where: { id },
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;


    const body = await req.json();
    // console.log("📝 Received Update Payload:", body);

    const {
      name,
      category,
      price,
      moq,
      desc,
      productImage,
      gallery,
      stockStatus,
      unit,
      deliveryType
    } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (desc !== undefined) updateData.desc = desc;
    if (productImage !== undefined) updateData.productImage = productImage;
    if (gallery !== undefined) updateData.gallery = gallery;

    if (price !== undefined) updateData.price = parseFloat(price);
    if (moq !== undefined) updateData.moq = parseInt(moq);

    if (stockStatus !== undefined) updateData.stockStatus = stockStatus;
    if (unit !== undefined) updateData.unit = unit;
    if (deliveryType !== undefined) updateData.deliveryType = deliveryType;

    // console.log("✅ Sanitized Update Data:", updateData);

    const updated = await prisma.product.update({
      where: { id },
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
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // We pass a second argument to $transaction to increase the timeout
    await prisma.$transaction(async (tx) => {
      await tx.favoriteProduct.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.order.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    },
      {
        maxWait: 5000,
        timeout: 30000,
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