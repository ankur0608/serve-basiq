import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ProductSchema = z.object({
    userId: z.string().cuid(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    cat: z.string().min(1, "Category is required"),
    price: z.number().positive("Price must be positive"),
    moq: z.string().min(1, "MOQ is required"),
    // 👇 This was causing the error because you sent "test"
    desc: z.string().min(10, "Description must be at least 10 characters"),
    img: z.string().url("Invalid Image URL"),
    gallery: z.array(z.string().url()).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📝 Product Payload:", body); // Debug log

        // 1. Validate Input
        const payload = ProductSchema.parse(body);

        // 2. Create Product in DB
        const product = await prisma.product.create({
            data: {
                userId: payload.userId,
                name: payload.name,
                cat: payload.cat,
                price: payload.price,
                moq: payload.moq,
                desc: payload.desc,
                img: payload.img,
                gallery: payload.gallery || [],
            },
        });

        return NextResponse.json({ success: true, product });

    } catch (error: any) {
        console.error("❌ Create Product Error:", error);

        // Handle Zod Validation Errors gracefully
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Validation Error", errors: error },
                { status: 400 } // Return 400 for bad input, not 500
            );
        }

        // Handle Prisma Database Errors
        return NextResponse.json(
            { message: "Database Error. Did you run 'npx prisma db push'?" },
            { status: 500 }
        );
    }
}