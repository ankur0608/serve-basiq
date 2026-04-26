import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// DELETE /api/rentals/[id]/slots/[slotId]  — owner removes a slot
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string; slotId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id, slotId } = await params;

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

        const slot = await prisma.rentalSlot.findUnique({
            where: { id: slotId },
            select: { rentalId: true, isBooked: true },
        });
        if (!slot || slot.rentalId !== id) {
            return NextResponse.json(
                { success: false, message: "Slot not found" },
                { status: 404 }
            );
        }
        if (slot.isBooked) {
            return NextResponse.json(
                { success: false, message: "Cannot remove a booked slot" },
                { status: 409 }
            );
        }

        await prisma.rentalSlot.delete({ where: { id: slotId } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[DELETE slot]", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete slot" },
            { status: 500 }
        );
    }
}
