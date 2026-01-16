import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Updated Validation Schema
const RequirementSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    type: z.enum(['PRODUCT', 'SERVICE']),
    title: z.string().min(3, "Title is required"),
    description: z.string().min(10, "Description must be at least 10 chars"),
    addressId: z.string().min(1, "Address is required"),
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
                title: data.title,
                description: data.description,
                addressId: data.addressId,
                status: "OPEN"
            }
        });

        return NextResponse.json({ success: true, requirement });

    } catch (error: any) {
        console.error("🔥 [API] Requirement Error:", error);
        return NextResponse.json({ success: false, message: "Failed to post requirement" }, { status: 500 });
    }
}