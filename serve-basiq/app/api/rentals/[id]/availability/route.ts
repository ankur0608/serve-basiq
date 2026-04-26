import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const Body = z.object({ isAvailable: z.boolean() });

// PATCH /api/rentals/[id]/availability — owner toggles rental availability
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const rental = await prisma.rental.findUnique({
            where: { id },
            select: { userId: true },
        });
        if (!rental || rental.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, message: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const parsed = Body.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: "Invalid body" },
                { status: 400 }
            );
        }

        const updated = await prisma.rental.update({
            where: { id },
            data: { isAvailable: parsed.data.isAvailable },
            select: { id: true, isAvailable: true },
        });

        return NextResponse.json({ success: true, rental: updated });
    } catch (error: any) {
        console.error("[PATCH availability]", error);
        return NextResponse.json(
            { success: false, message: "Failed to update availability" },
            { status: 500 }
        );
    }
}
