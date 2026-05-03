import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SlotInput = z.object({
    date: z.string().min(1).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
});

const CreateBody = z.object({
    slots: z.array(SlotInput).min(1),
});

// GET /api/rentals/[id]/slots?from=YYYY-MM-DD&to=YYYY-MM-DD
// Public — booking form consumes this
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        const where: any = { rentalId: id, isActive: true };
        if (from || to) {
            where.date = {};
            if (from) where.date.gte = new Date(from);
            if (to) where.date.lte = new Date(to);
        }

        const slots = await prisma.rentalSlot.findMany({
            where,
            orderBy: [{ date: "asc" }, { startTime: "asc" }],
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                isBooked: true,
            },
        });

        return NextResponse.json({ success: true, slots });
    } catch (error: any) {
        console.error("[GET slots]", error);
        return NextResponse.json(
            { success: false, message: "Failed to load slots" },
            { status: 500 }
        );
    }
}

// POST /api/rentals/[id]/slots  — owner adds one or more slots
export async function POST(
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
        if (!rental) {
            return NextResponse.json(
                { success: false, message: "Rental not found" },
                { status: 404 }
            );
        }
        if (rental.userId !== session.user.id) {
            return NextResponse.json(
                { success: false, message: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const parsed = CreateBody.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, message: "Invalid slots", errors: parsed.error.format() },
                { status: 400 }
            );
        }

        const created = await prisma.$transaction(
            parsed.data.slots.map((s) =>
                prisma.rentalSlot.create({
                    data: {
                        rentalId: id,
                        date: s.date ? new Date(s.date) : new Date(),
                        startTime: s.startTime,
                        endTime: s.endTime,
                    },
                })
            )
        );

        return NextResponse.json({ success: true, slots: created });
    } catch (error: any) {
        console.error("[POST slots]", error);
        return NextResponse.json(
            { success: false, message: "Failed to create slots" },
            { status: 500 }
        );
    }
}
