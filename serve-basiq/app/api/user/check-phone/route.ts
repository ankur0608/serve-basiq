// app/api/user/check-phone/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const phone = searchParams.get("phone");

        if (!phone || phone.length !== 10) {
            return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { phone },
            select: { id: true } // Only select the ID for security
        });

        return NextResponse.json({
            exists: !!existingUser,
            userId: existingUser?.id || null
        });

    } catch (error) {
        console.error("Check Phone Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}