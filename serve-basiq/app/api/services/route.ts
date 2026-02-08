import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceSettingsSchema } from "@/lib/validators";
export const dynamic = 'force-dynamic';

const userSelect = {
    id: true,
    name: true,
    image: true,
    profileImage: true,
    email: true,
    phone: true,
    shopName: true,
    isVerified: true,
    role: true,
    instagramUrl: true,
    facebookUrl: true,
    youtubeUrl: true,
    websiteUrl: true,
    createdAt: true,
    addresses: {
        select: {
            id: true,
            type: true,
            line1: true,
            line2: true,
            landmark: true,
            city: true,
            state: true,
            pincode: true,
            country: true
        }
    }
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : undefined;


        const whereClause = {
            isVerified: true,
            ...(userId && { userId: userId })
        };

        const [services, rentals] = await Promise.all([
            // 1. Fetch Verified Services
            prisma.service.findMany({
                where: whereClause,
                take: limit,
                include: {
                    category: { select: { id: true, name: true } },
                    subcategory: { select: { id: true, name: true } },
                    user: { select: userSelect }
                },
                orderBy: { createdAt: 'desc' },
            }),

            // 2. Fetch Verified Rentals
            prisma.rental.findMany({
                where: whereClause,
                take: limit,
                include: {
                    category: { select: { id: true, name: true } },
                    subcategory: { select: { id: true, name: true } },
                    user: { select: userSelect }
                },
                orderBy: { createdAt: 'desc' },
            })
        ]);

        return NextResponse.json({
            services,
            rentals
        });

    } catch (error: any) {
        console.error("GET Listings Error:", error);
        return NextResponse.json({ error: "Failed to fetch listings", details: error.message }, { status: 500 });
    }
}
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, serviceId, ...formData } = body;

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized: Missing User ID" }, { status: 401 });
        }

        const data = serviceSettingsSchema.parse(formData);

        const servicePayload = {
            name: data.name,
            desc: data.desc,
            serviceimg: formData.serviceimg || data.mainimg || "",
            mainimg: data.mainimg || formData.serviceimg || "",
            coverImg: data.coverImg || "",
            price: data.price,
            experience: data.experience,
            priceType: data.priceType || "FIXED",
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            radiusKm: data.radiusKm,
            latitude: data.latitude,
            longitude: data.longitude,
            workingDays: data.workingDays,
            openTime: data.openTime,
            closeTime: data.closeTime,
            gallery: data.gallery || [],
        };

        const userSocialsUpdate = {
            instagramUrl: data.instagramUrl,
            facebookUrl: data.facebookUrl,
            websiteUrl: data.websiteUrl,
            youtubeUrl: data.youtubeUrl,
        };

        const categoryRelation = data.categoryId ? { connect: { id: data.categoryId } } : undefined;

        const rawSubId = (formData as any).subCategoryId || (data.subCategoryIds && data.subCategoryIds[0]);
        const subCategoryRelation = rawSubId ? { connect: { id: rawSubId } } : undefined;

        let result;

        if (serviceId) {
            // --- UPDATE ---
            result = await prisma.service.update({
                where: { id: serviceId },
                data: {
                    ...servicePayload,
                    category: categoryRelation,
                    subcategory: subCategoryRelation,
                    user: { update: userSocialsUpdate }
                },
            });
        } else {
            // --- CREATE ---
            result = await prisma.service.create({
                data: {
                    ...servicePayload,
                    category: categoryRelation,
                    subcategory: subCategoryRelation,
                    user: { connect: { id: userId } }
                },
            });

            await prisma.user.update({
                where: { id: userId },
                data: userSocialsUpdate
            });
        }

        return NextResponse.json({ success: true, service: result });
    } catch (error: any) {
        console.error("POST Service Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Server Error" }, { status: 500 });
    }
}

// ============================================================================
// 3. DELETE (Handles both Services and Rentals)
// ============================================================================
export async function DELETE(req: Request) {
    try {
        const { userId, serviceId } = await req.json();
        if (!userId || !serviceId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        // 1. Try deleting from Service first
        const serviceDelete = await prisma.service.deleteMany({
            where: { id: serviceId, userId: userId }
        });

        if (serviceDelete.count > 0) {
            return NextResponse.json({ success: true, message: "Service Deleted" });
        }

        // 2. If not found in Service, try deleting from Rental
        const rentalDelete = await prisma.rental.deleteMany({
            where: { id: serviceId, userId: userId }
        });

        if (rentalDelete.count > 0) {
            return NextResponse.json({ success: true, message: "Rental Deleted" });
        }

        return NextResponse.json({ error: "Not found" }, { status: 404 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}