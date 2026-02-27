import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const isVideo = (url: string) => url.match(/\.(mp4|webm)$/i) || url.includes('video');

const ProductSchema = z.object({
    name: z.string(),
    desc: z.string().optional().or(z.literal('')),
    productImages: z.array(z.string()).min(1, "At least one product image is required").max(5, "Maximum 5 product images allowed"),

    gallery: z.array(z.string())
        .max(50, "Gallery cannot exceed 50 items")
        .optional()
        .refine((urls) => {
            if (!urls) return true;
            const videoCount = urls.filter(isVideo).length;
            const imageCount = urls.length - videoCount;
            return imageCount <= 45 && videoCount <= 5;
        }, "Gallery can have a maximum of 45 images and 5 videos"),

    price: z.number(),
    moq: z.number(),

    categoryId: z.string().min(1, "Category is required"),
    subCategoryId: z.string().optional(),

    stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'ON_DEMAND', 'MADE_TO_ORDER']).default('IN_STOCK'),
    unit: z.enum(['PIECE', 'KG', 'GRAM', 'LITER', 'ML', 'BOX', 'PACK', 'SET', 'METER', 'SQ_FT', 'TON']).default('PIECE'),
    deliveryType: z.enum(['PICKUP', 'DELIVERY', 'BOTH']).default('DELIVERY'),
    condition: z.enum(['NEW', 'USED', 'REFURBISHED']).default('NEW'),
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
            // ✅ Map BOTH the single string and the array to Prisma
            productImage: data.productImages[0],
            productImages: data.productImages,
            gallery: data.gallery || [],
            price: data.price,
            moq: data.moq,
            stockStatus: data.stockStatus,
            unit: data.unit,
            deliveryType: data.deliveryType,
            condition: data.condition,
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
            // ✅ Replaced .errors with .issues which is fully typed in Zod
            console.error("Zod Validation Error Details:", JSON.stringify(error.issues, null, 2));
            return NextResponse.json({
                success: false,
                message: "Validation Error",
                errors: error.issues
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            message: error.message || "Server Error"
        }, { status: 500 });
    }
}