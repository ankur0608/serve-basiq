import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RequirementSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    type: z.enum(['PRODUCT', 'SERVICE']),
    title: z.string().min(3, "Title is required"),
    description: z.string().min(10, "Description must be at least 10 chars"),
    timeline: z.enum(['URGENT', 'IMMEDIATE', 'LATER', 'FLEXIBLE']),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // console.log("📥 [API] Received Body:", body);

        const validation = RequirementSchema.safeParse(body);

        if (!validation.success) {
            console.error("❌ [API] Validation Failed:", validation.error.format());
            return NextResponse.json({ success: false, errors: validation.error.format() }, { status: 400 });
        }

        const data = validation.data;

        // 1. Check User
        const user = await prisma.user.findUnique({
            where: { id: data.userId }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // 2. Create Requirement
        const requirement = await prisma.requirement.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                description: data.description,
                status: "OPEN",

                timeline: data.timeline
            }
        });

        // console.log("✅ [API] Created:", requirement.id);
        return NextResponse.json({ success: true, requirement });

    } catch (error: any) {
        console.error("🔥 [API Error]:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}