import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 1. Updated Zod Schema to match Frontend Payload
const ProductSchema = z.object({
    name: z.string(),
    desc: z.string().optional().or(z.literal('')),
    productImage: z.string().min(1, "Main image is required"),
    gallery: z.array(z.string()).optional(),
    price: z.number(),
    moq: z.number(),

    // ✅ Changed from 'category' to 'categoryId'
    categoryId: z.string().min(1, "Category is required"),
    // ✅ Added subcategories array
    subCategoryIds: z.array(z.string()).optional(),

    stockStatus: z.enum(['IN_STOCK', 'ON_DEMAND']).default('IN_STOCK'),
    unit: z.enum(['PIECE', 'KG', 'BOX', 'LITER']).default('PIECE'),
    deliveryType: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📝 [API] Product Create/Update Body:", JSON.stringify(body, null, 2));

        const { userId, productId, ...formData } = body;

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // 2. Validate with Zod
        const data = ProductSchema.parse(formData);

        // 3. Prepare Relation Connections
        const subCategoryConnect = data.subCategoryIds?.map((id) => ({ id })) || [];

        const basePayload = {
            name: data.name,
            desc: data.desc || "",
            productImage: data.productImage,
            gallery: data.gallery || [],
            price: data.price,
            moq: data.moq,
            stockStatus: data.stockStatus,
            unit: data.unit,
            deliveryType: data.deliveryType,
            isVerified: false,
        };

        let product;

        if (productId) {
            // --- UPDATE EXISTING PRODUCT ---
            console.log(`🔄 Updating Product: ${productId}`);
            product = await prisma.product.update({
                where: { id: productId },
                data: {
                    ...basePayload,
                    // Update Category (Connect New / Disconnect Old)
                    category: data.categoryId
                        ? { connect: { id: data.categoryId } }
                        : { disconnect: true },

                    // Update Subcategories (Replace list using 'set')
                    subcategories: {
                        set: subCategoryConnect
                    }
                },
            });
        } else {
            // --- CREATE NEW PRODUCT ---
            console.log(`✨ Creating Product for User: ${userId}`);
            product = await prisma.product.create({
                data: {
                    // Connect User
                    user: { connect: { id: userId } },

                    ...basePayload,

                    // Connect Category
                    category: {
                        connect: { id: data.categoryId }
                    },

                    // Connect Subcategories (Use 'connect' for create)
                    subcategories: {
                        connect: subCategoryConnect
                    }
                },
            });
        }

        console.log("✅ Success! Product ID:", product.id);
        return NextResponse.json({ success: true, product });

    } catch (error: any) {
        console.error("❌ Create Product Error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, message: "Validation Error" }, { status: 400 });
        }

        return NextResponse.json({ success: false, message: error.message || "Server Error" }, { status: 500 });
    }
}