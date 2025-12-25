import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ServiceSchema = z.object({
    userId: z.string().cuid(),
    name: z.string().min(2),
    cat: z.string(),
    price: z.number().positive(),
    loc: z.string().min(2),
    desc: z.string().min(10),
    img: z.string().url(),
    gallery: z.array(z.string().url()).max(4).optional(),

});

export async function POST(req: Request) {
    try {
        const body = ServiceSchema.parse(await req.json());

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: body.userId },
                select: { id: true },
            });

            if (!user) {
                throw new Error("USER_NOT_FOUND");
            }

            const service = await tx.service.upsert({
                where: { userId: body.userId },
                update: {
                    name: body.name,
                    cat: body.cat,
                    price: body.price,
                    loc: body.loc,
                    desc: body.desc,
                    img: body.img,
                    gallery: body.gallery ?? [],
                },
                create: {
                    ...body,
                    gallery: body.gallery ?? [],
                    verified: false,
                    rating: 5,
                },
            });

            // Update User Role AND switch to Admin Dashboard mode
            await tx.user.update({
                where: { id: body.userId },
                data: {
                    isWorker: true,
                    isWebsite: false // ✅ Switch to Admin Dashboard mode
                },
            });

            return service;
        });

        return NextResponse.json({ success: true, service: result });
    } catch (err: any) {
        if (err.message === "USER_NOT_FOUND") {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (err.name === "ZodError") {
            return NextResponse.json({ message: "Invalid payload", errors: err.errors }, { status: 400 });
        }

        console.error(err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}