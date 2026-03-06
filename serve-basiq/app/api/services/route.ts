import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const limit = parseInt(searchParams.get("limit") || "12");
        const cursor = searchParams.get("cursor");

        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const subcategoryId = searchParams.get("subcategoryId");
        const search = searchParams.get("search");
        const location = searchParams.get("location");
        const sort = searchParams.get("sort");

        const where: any = {
            isVerified: true,
            user: {
                isVerified: true,
            }
        };

        if (userId) where.userId = userId;
        if (categoryId) where.categoryId = categoryId;
        if (subcategoryId) where.subCategoryId = subcategoryId;

        if (location) {
            where.user = {
                ...where.user,
                addresses: {
                    some: {
                        type: { equals: 'Work', mode: 'insensitive' },
                        city: { equals: location, mode: 'insensitive' }
                    }
                }
            };
        }

        if (search) {
            where.AND = [
                {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { desc: { contains: search, mode: 'insensitive' } },
                    ]
                }
            ];
        }

        let orderBy: any = { createdAt: "desc" };

        switch (sort) {
            case "price_asc":
                orderBy = { price: "asc" };
                break;
            case "price_desc":
                orderBy = { price: "desc" };
                break;
            case "rating":
                orderBy = { rating: "desc" };
                break;
            case "popular":
                orderBy = { reviews: { _count: "desc" } };
                break;
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
                        isVerified: true, shopName: true,
                        addresses: {
                            where: { type: 'Work' },
                            select: { city: true }
                        }
                    }
                }
            },
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            orderBy,
        });

        let nextCursor = undefined;
        if (services.length > limit) {
            const nextItem = services.pop();
            nextCursor = nextItem?.id;
        }

        return NextResponse.json({
            items: services,
            nextCursor
        });

    } catch (error: any) {
        console.error("API ERROR [GET /api/services]:", error.message);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch services",
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // console.log("📥 [Service API] Received Body:", body);

        const {
            id, userId, name, desc, serviceimg, serviceImages, coverImg, gallery,
            categoryId, subCategoryId, subCategoryIds,
            customCategoryName, // ✅ Extract what the user typed
            price, priceType, experience, workingDays, openTime, closeTime, is24x7, isRemote,
            altPhone, radiusKm, latitude, longitude, addressLine1, addressLine2, city, state, pincode
        } = body;

        if (!userId || !name || !serviceimg || price === undefined) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const finalSubId = subCategoryId || (Array.isArray(subCategoryIds) && subCategoryIds.length > 0 ? subCategoryIds[0] : null);

        const dataPayload: any = {
            name, desc, serviceimg, serviceImages: serviceImages || [], coverImg, gallery: gallery || [],
            price: parseFloat(price) || 0, priceType: priceType || 'FIXED',
            experience: experience ? parseInt(experience) : 0,
            radiusKm: parseInt(radiusKm) || 10,
            latitude: latitude ? parseFloat(latitude) : null, longitude: longitude ? parseFloat(longitude) : null,
            addressLine1, addressLine2, city, state, pincode, altPhone,
            workingDays: workingDays || [], openTime, closeTime, is24x7: is24x7 === true, isRemote: isRemote === true,

            // 🌟 THE FIX: Save the custom text directly to our new database field
            customCategory: categoryId === 'OTHER' ? customCategoryName : null
        };

        // Connect official category only if it is NOT "OTHER"
        if (categoryId && categoryId !== 'OTHER') {
            dataPayload.category = { connect: { id: categoryId } };
        }

        // Connect subcategory only if they picked a real main category
        if (finalSubId && categoryId !== 'OTHER') {
            dataPayload.subcategory = { connect: { id: finalSubId } };
        }

        let service;
        if (id) {
            service = await prisma.service.update({ where: { id }, data: dataPayload });
        } else {
            service = await prisma.service.create({ data: { user: { connect: { id: userId } }, ...dataPayload } });
        }

        return NextResponse.json({ success: true, service });

    } catch (error: any) {
        console.error("🔥 Error saving service:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}