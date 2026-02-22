import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ProductSchema = z.object({
    name: z.string(),
    desc: z.string().optional().or(z.literal('')),
    productImage: z.string().min(1, "Main image is required"),
    gallery: z.array(z.string()).optional(),
    price: z.number(),
    moq: z.number(),

    categoryId: z.string().min(1, "Category is required"),

    subCategoryId: z.string().optional(),

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
        if (formData.subCategoryIds && Array.isArray(formData.subCategoryIds) && formData.subCategoryIds.length > 0) {
            formData.subCategoryId = formData.subCategoryIds[0];
        }

        const data = ProductSchema.parse(formData);

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
            console.log(`🔄 Updating Product: ${productId}`);
            product = await prisma.product.update({
                where: { id: productId },
                data: {
                    ...basePayload,
                    category: data.categoryId
                        ? { connect: { id: data.categoryId } }
                        : { disconnect: true },

                    subcategory: data.subCategoryId
                        ? { connect: { id: data.subCategoryId } }
                        : { disconnect: true },
                },
            });
        } else {
            console.log(`✨ Creating Product for User: ${userId}`);
            product = await prisma.product.create({
                data: {
                    user: { connect: { id: userId } },

                    ...basePayload,

                    category: data.categoryId
                        ? { connect: { id: data.categoryId } }
                        : undefined,

                    subcategory: data.subCategoryId
                        ? { connect: { id: data.subCategoryId } }
                        : undefined,
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