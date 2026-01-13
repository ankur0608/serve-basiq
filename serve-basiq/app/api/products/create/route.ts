import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ✅ 1. Updated Zod Schema to match Frontend Payload & Prisma Model
const ProductSchema = z.object({
    userId: z.string(),
    name: z.string(),
    desc: z.string(),

    // Matches 'productImage' from frontend
    productImage: z.string().url(),

    // Matches 'gallery' array
    gallery: z.array(z.string()).optional(),

    price: z.number(), // ✅ Accepts number now
    moq: z.number(),   // ✅ Accepts number now (since Prisma 'moq' is Int)

    // Matches 'category' from frontend
    category: z.string(),

    // Enums
    stockStatus: z.enum(['IN_STOCK', 'ON_DEMAND']).default('IN_STOCK'),
    unit: z.enum(['PIECE', 'KG', 'BOX', 'LITER']).default('PIECE'),
    deliveryType: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        console.log("📝 Incoming Payload:", body);

        // 1. Validate
        const payload = ProductSchema.parse(body);

        // 2. Create in DB
        const product = await prisma.product.create({
            data: {
                userId: payload.userId,
                name: payload.name,
                desc: payload.desc,
                category: payload.category, // ✅ Mapped correctly
                price: payload.price,
                moq: payload.moq,
                productImage: payload.productImage, // ✅ Mapped correctly
                gallery: payload.gallery || [],
                stockStatus: payload.stockStatus,
                unit: payload.unit,
                deliveryType: payload.deliveryType,
                isVerified: false,
            },
        });

        return NextResponse.json({ success: true, product });

    } catch (error: any) {
        console.error("❌ Create Product Error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false}, { status: 400 });
        }

        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}