// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteR2Files } from "@/lib/r2"; 
export async function GET(
  req: NextRequest,
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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await req.json();
    console.log(`📥 [PATCH API] Received request to update PRODUCT id: ${productId}`);

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        productImage: true,
        productImages: true,
        // gallery: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const oldUrls = [
      existingProduct.productImage,
      ...(Array.isArray(existingProduct.productImages) ? existingProduct.productImages : []),
      // ...(Array.isArray(existingProduct.gallery) ? existingProduct.gallery : [])
    ].filter(Boolean) as string[];

    // Flatten new URLs coming from the frontend payload
    const newUrls = [
      body.productImage,
      ...(Array.isArray(body.productImages) ? body.productImages : []),
      // ...(Array.isArray(body.gallery) ? body.gallery : [])
    ].filter(Boolean) as string[];

    const urlsToDelete = oldUrls.filter(oldUrl => !newUrls.includes(oldUrl));

    if (urlsToDelete.length > 0) {
      console.log(`📸 [PATCH API] Found ${urlsToDelete.length} orphaned media files to delete:`, urlsToDelete);
    }

    console.log(`💥 [PATCH API] Updating database record...`);
    const numericPrice = body.priceType === 'QUOTE' ? 0 : parseFloat(body.price || "0");
    const numericMoq = parseInt(body.moq || "1");

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        desc: body.desc,

        priceType: body.priceType,
        price: numericPrice,

        moq: numericMoq,
        stockStatus: body.stockStatus,
        unit: body.unit,
        deliveryType: body.deliveryType,
        condition: body.condition,

        productImage: body.productImages?.[0] || body.productImage,
        productImages: body.productImages || [],
        // gallery: body.gallery || [],

        customCategory: body.categoryId === 'OTHER' ? body.customCategoryName : null,
        category: body.categoryId && body.categoryId !== 'OTHER'
          ? { connect: { id: body.categoryId } }
          : { disconnect: true },
        subcategory: body.subCategoryId && body.categoryId !== 'OTHER'
          ? { connect: { id: body.subCategoryId } }
          : { disconnect: true },
      }
    });

    if (urlsToDelete.length > 0) {
      console.log(`🗑️ [PATCH API] Sending URLs to R2 deletion script...`);
      await deleteR2Files(urlsToDelete);
      console.log("✅ [PATCH API] R2 cleanup completed.");
    } else {
      console.log("⏭️ [PATCH API] No media was removed during this update. Skipping R2 cleanup.");
    }

    console.log("🎉 [PATCH API] Successfully updated PRODUCT.");
    return NextResponse.json({ success: true, product: updatedProduct });

  } catch (error: any) {
    console.error("❌ [PATCH API] Product Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📥 [DELETE API] Received request to delete PRODUCT id: ${id}`);

    // 1. Fetch the product FIRST to get all media URLs
    console.log(`🔍 [DELETE API] Fetching PRODUCT record...`);
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        productImage: true,
        productImages: true,
        // gallery: true
      }
    });

    if (!product) {
      console.log("⚠️ [DELETE API] PRODUCT record not found in DB.");
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. Gather all image and video URLs into a single array
    const urlsToDelete = [
      product.productImage,
      ...(Array.isArray(product.productImages) ? product.productImages : []),
      // ...(Array.isArray(product.gallery) ? product.gallery : [])
    ].filter(Boolean) as string[];

    console.log("📸 [DELETE API] Found PRODUCT media to delete:", urlsToDelete);

    // 3. Delete from R2
    if (urlsToDelete.length > 0) {
      console.log(`🗑️ [DELETE API] Sending ${urlsToDelete.length} URLs to R2 deletion script...`);
      await deleteR2Files(urlsToDelete);
      console.log("✅ [DELETE API] R2 deletion step completed.");
    } else {
      console.log("⏭️ [DELETE API] No URLs found to delete from R2. Skipping.");
    }

    // 4. Delete from Database (Using Transaction)
    console.log(`💥 [DELETE API] Deleting PRODUCT record and associated data from database...`);
    await prisma.$transaction(async (tx) => {
      // Clear out relations to prevent foreign key constraint errors
      await tx.favoriteProduct.deleteMany({ where: { productId: id } });
      await tx.review.deleteMany({ where: { productId: id } });
      await tx.order.deleteMany({ where: { productId: id } });
      
      // Delete the actual product
      await tx.product.delete({ where: { id } });
    }, {
      maxWait: 5000,
      timeout: 30000,
    });

    console.log("🎉 [DELETE API] Successfully deleted PRODUCT database record.");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ [DELETE API] Fatal Error:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}