import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // --- PAGINATION ---
        const limit = parseInt(searchParams.get("limit") || "12");
        const cursor = searchParams.get("cursor");

        // --- FILTERS ---
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const subcategoryId = searchParams.get("subcategoryId");
        const search = searchParams.get("search");

        const where: any = {};

        // Only include filters if they have a value
        if (userId) where.userId = userId;
        if (categoryId) where.categoryId = categoryId;
        if (subcategoryId) where.subCategoryId = subcategoryId;

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { desc: { contains: search, mode: 'insensitive' } },
            ];
        }

        const services = await prisma.service.findMany({
            where,
            include: {
                category: { select: { id: true, name: true } },
                subcategory: { select: { id: true, name: true } },
                _count: { select: { reviews: true } },
                user: {
                    select: {
                        id: true, name: true, image: true, phone: true,
                        isVerified: true, shopName: true
                    }
                }
            },
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            orderBy: { createdAt: "desc" },
        });

        let nextCursor = undefined;
        if (services.length > limit) {
            const nextItem = services.pop();
            nextCursor = nextItem?.id;
        }

        // We return { items: [...] } to match your useInfiniteQuery logic
        return NextResponse.json({
            items: services,
            nextCursor
        });

    } catch (error: any) {
        console.error("API ERROR:", error.message);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch services",
        }, { status: 500 });
    }
}
// ✅ POST: Create/Update Service
export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📥 [Service API] Received Body:", body);

        const {
            id,
            userId,
            name,
            desc,
            serviceimg,
            coverImg,
            gallery,
            categoryId,
            subCategoryId,
            subCategoryIds, // Frontend might send this array
            price,
            priceType,
            experience,
            workingDays,
            openTime,
            closeTime,
            altPhone,
            radiusKm,
            latitude,
            longitude,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode
        } = body;

        // Validation
        if (!userId || !name || !serviceimg || !price) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Handle Subcategory Logic
        const finalSubId = subCategoryId || (Array.isArray(subCategoryIds) && subCategoryIds.length > 0 ? subCategoryIds[0] : null);

        // Prepare Data Payload
        const dataPayload: any = {
            name,
            desc,
            serviceimg,
            coverImg,
            gallery,
            price: parseFloat(price),
            priceType: priceType || 'FIXED',
            experience: experience ? parseInt(experience) : 0,
            radiusKm: parseInt(radiusKm) || 10,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            addressLine1, addressLine2, city, state, pincode,
            altPhone,
            workingDays: workingDays || [],
            openTime,
            closeTime,
        };

        // ✅ FIX 2: Handle Relations robustly for Update vs Create
        // Only add connection logic if IDs are actually provided
        if (categoryId) {
            dataPayload.category = { connect: { id: categoryId } };
        }

        if (finalSubId) {
            dataPayload.subcategory = { connect: { id: finalSubId } };
        }

        let service;

        if (id) {
            // ✅ UPDATE Service
            // If updating, we might need to disconnect old relations if they changed, 
            // but `connect` usually overwrites specific 1-to-many relations in Prisma 
            // if it's a single relation field. 
            // Ensure your schema allows updating this way.
            service = await prisma.service.update({
                where: { id },
                data: dataPayload
            });
        } else {
            // ✅ CREATE Service
            service = await prisma.service.create({
                data: {
                    user: { connect: { id: userId } },
                    ...dataPayload,
                }
            });
        }

        return NextResponse.json({ success: true, service });

    } catch (error: any) {
        console.error("🔥 Error saving service:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}