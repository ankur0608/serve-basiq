import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificationSchema } from "@/lib/validators";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, ...formData } = body;

        const data = verificationSchema.parse(formData);

        await prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                verificationStatus: "SUBMITTED", // Change status to indicate review needed
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}