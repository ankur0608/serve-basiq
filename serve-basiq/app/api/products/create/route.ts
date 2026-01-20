import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { CategoryType } from "@prisma/client";

// Zod Schema
const ProductSchema = z.object({
    userId: z.string(),
    name: z.string(),
    desc: z.string(),
    productImage: z.string().url(),
    gallery: z.array(z.string()).optional(),
    price: z.number(),
    moq: z.number(),

    category: z.string(),

    stockStatus: z.enum(['IN_STOCK', 'ON_DEMAND']).default('IN_STOCK'),
    unit: z.enum(['PIECE', 'KG', 'BOX', 'LITER']).default('PIECE'),
    deliveryType: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📝 [API] Creating Product:", body.name);

        const payload = ProductSchema.parse(body);

        const product = await prisma.product.create({
            data: {
                // ✅ FIX: Use 'connect' instead of raw 'userId'
                // This forces Prisma to use the correct input type that allows nested writes (like category)
                user: {
                    connect: { id: payload.userId }
                },

                name: payload.name,
                desc: payload.desc,
                price: payload.price,
                moq: payload.moq,
                productImage: payload.productImage,
                gallery: payload.gallery || [],
                stockStatus: payload.stockStatus,
                unit: payload.unit,
                deliveryType: payload.deliveryType,
                isVerified: false,

                // ✅ Link to Category
                category: {
                    connectOrCreate: {
                        where: { name: payload.category },
                        create: {
                            name: payload.category,
                            type: CategoryType.PRODUCT
                        },
                    },
                },
            },
            include: {
                category: true
            }
        });

        return NextResponse.json({ success: true, product });

    } catch (error: any) {
        console.error("❌ Create Product Error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}