import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming you have a prisma instance export
import { onboardSchema } from "@/lib/validators";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validData = onboardSchema.parse(body);
        const { userId, ...data } = body;

        // Transaction: Update User, Create Address, Create Skeleton Service
        await prisma.$transaction(async (tx) => {
            // 1. Update User Profile
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: validData.fullName,
                    email: validData.email,
                    img: validData.img,
                    isWorker: true,
                    isWebsite: false, // Switch them to Pro mode immediately
                },
            });

            // 2. Create Address
            await tx.address.create({
                data: {
                    userId: userId,
                    line1: validData.addressLine1,
                    line2: validData.addressLine2 || "",
                    city: validData.city,
                    state: validData.state,
                    pincode: validData.pincode,
                },
            });

            // 3. Create Skeleton Service (Required for Dashboard logic)
            const existingService = await tx.service.findUnique({ where: { userId } });
            if (!existingService) {
                await tx.service.create({
                    data: {
                        userId: userId,
                        name: validData.fullName,
                        desc: "New Service Provider",
                        img: validData.img,
                        altPhone: validData.altPhone,
                    },
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { z } from "zod";

// const OnboardSchema = z.object({
//     userId: z.string().cuid(),
//     fullName: z.string().min(2, "Name required"),
//     img: z.string().url("Image required"),
//     email: z.string().email(),
//     altPhone: z.string().optional(),
//     address: z.object({
//         line1: z.string().min(1, "Address Line 1 required"),
//         line2: z.string().optional(),
//         city: z.string().min(1, "City required"),
//         state: z.string().min(1, "State required"),
//         pincode: z.string().min(1, "Pincode required"),
//     })
// });

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();
//         const payload = OnboardSchema.parse(body);

//         // We use a transaction to ensure all 3 parts (User, Service, Address) are saved
//         await prisma.$transaction(async (tx) => {

//             // 1. Update User Basic Info & Role
//             await tx.user.update({
//                 where: { id: payload.userId },
//                 data: {
//                     name: payload.fullName,
//                     email: payload.email,
//                     img: payload.img,
//                     isWorker: true,
//                     isWebsite: false,
//                 },
//             });

//             // 2. Upsert Service to store Alt Phone
//             // (Even if we aren't storing full service details yet, we need this record for the profile)
//             await tx.service.upsert({
//                 where: { userId: payload.userId },
//                 update: {
//                     name: payload.fullName, // Default service name to User name initially
//                     img: payload.img,
//                     altPhone: payload.altPhone,
//                 },
//                 create: {
//                     userId: payload.userId,
//                     name: payload.fullName,
//                     desc: "New Provider",
//                     img: payload.img,
//                     altPhone: payload.altPhone,
//                 }
//             });

//             // 3. Create Address
//             await tx.address.create({
//                 data: {
//                     userId: payload.userId,
//                     // Combine line2 if provided, or store simply
//                     line1: payload.address.line2 ? `${payload.address.line1}, ${payload.address.line2}` : payload.address.line1,
//                     city: payload.address.city,
//                     state: payload.address.state,
//                     pincode: payload.address.pincode,
//                     type: "Home" // Default
//                 }
//             });
//         });

//         return NextResponse.json({ success: true });

//     } catch (err: any) {
//         console.error("Onboard Error:", err);
//         if (err instanceof z.ZodError) {
//             return NextResponse.json({ message: "Invalid Inputs" }, { status: 400 });
//         }
//         return NextResponse.json({ message: "Server error" }, { status: 500 });
//     }
// }