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
    social: z.object({
        instagram: z.string().url().optional(),
        facebook: z.string().url().optional(),
        website: z.string().url().optional(),
    }).optional(),
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
                    social: body.social ?? {},
                },
                create: {
                    ...body,
                    gallery: body.gallery ?? [],
                    social: body.social ?? {},
                    verified: false,
                    rating: 5,
                },
            });

            await tx.user.update({
                where: { id: body.userId },
                data: { isWorker: true },
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



// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         const { userId, name, cat, price, loc, desc, img, gallery, social } = body;

//         console.log(`[API] Received request for User ID: ${userId}`);

//         // 🔍 DEBUG: Check Payload Size
//         // Calculate size in Megabytes
//         const payloadSize = JSON.stringify(body).length / 1024 / 1024;
//         console.log(`[API] Payload Size: ${payloadSize.toFixed(2)} MB`);

//         // 🛑 SAFETY CHECK: Reject if > 2MB (Neon/Prisma often struggle with more)
//         if (payloadSize > 2) {
//             console.error("[API] Payload too large!");
//             return NextResponse.json({
//                 message: `Images are too large (${payloadSize.toFixed(2)}MB). Total limit is 2MB. Please use smaller images.`
//             }, { status: 413 }); // 413 = Payload Too Large
//         }

//         // 1. Validation
//         if (!userId || !name || !cat || !price) {
//             return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
//         }

//         // 2. Check if User Exists
//         const user = await prisma.user.findUnique({ where: { id: userId } });
//         if (!user) {
//             return NextResponse.json({ message: "User not found. Re-login." }, { status: 404 });
//         }

//         // 3. Create/Update Service
//         console.log("[API] Upserting Service...");
//         const service = await prisma.service.upsert({
//             where: { userId: userId },
//             update: { name, cat, price, loc, desc, img, gallery, social },
//             create: {
//                 userId,
//                 name,
//                 cat,
//                 price,
//                 loc,
//                 desc,
//                 img,
//                 gallery: gallery || [],
//                 social: social || {},
//                 verified: false,
//                 rating: 5.0
//             }
//         });

//         // 4. Update User Role
//         await prisma.user.update({
//             where: { id: userId },
//             data: { isWorker: true }
//         });

//         console.log("[API] Success!");
//         return NextResponse.json({ success: true, service });

//     } catch (error: any) {
//         console.error("Create Service Error:", error);
//         return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
//     }
// }