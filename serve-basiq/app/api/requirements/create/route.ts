import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation Schema
const RequirementSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    type: z.enum(['PRODUCT', 'SERVICE']),
    category: z.string().min(1, "Category is required"),
    title: z.string().min(3, "Title/Product Name is required"),
    description: z.string().min(10, "Description must be at least 10 chars"),

    quantity: z.number().optional(),
    unit: z.enum(['PIECE', 'KG', 'BOX', 'LITER']).optional(),
    budget: z.string().optional(),

    addressId: z.string().min(1, "Address is required"),
    paymentMode: z.enum(['ONLINE', 'CASH']),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📝 [API] New Requirement:", body);

        // 1. Validate
        const validation = RequirementSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
        }

        const data = validation.data;

        // 2. Create in DB
        const requirement = await prisma.requirement.create({
            data: {
                userId: data.userId,
                type: data.type,
                category: data.category,
                title: data.title,
                description: data.description,
                quantity: data.quantity || null,
                unit: data.unit || null,
                budget: data.budget || null,
                addressId: data.addressId,
                paymentMode: data.paymentMode,
                status: "OPEN"
            }
        });

        return NextResponse.json({ success: true, requirement });

    } catch (error: any) {
        console.error("🔥 [API] Requirement Error:", error);
        return NextResponse.json({ success: false, message: "Failed to post requirement" }, { status: 500 });
    }
}