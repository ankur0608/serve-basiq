import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const limit = parseInt(searchParams.get("limit") || "24");
        const cursor = searchParams.get("cursor");

        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const subcategoryId = searchParams.get("subcategoryId");
        const search = searchParams.get("search");
        const location = searchParams.get("location");
        const sort = searchParams.get("sort");

        const where: any = {
            isVerified: true,
            user: { isVerified: true }
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
                        { desc: { contains: search, mode: 'insensitive' } }
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
            case "popular":
                orderBy = { reviews: { _count: "desc" } };
                break;
        }

        const includeObj = {
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
        };

        const rentals = await prisma.rental.findMany({
            where,
            include: includeObj,
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            orderBy,
        });

        let nextCursor = undefined;
        if (rentals.length > limit) {
            const nextItem = rentals.pop();
            nextCursor = nextItem?.id;
        }

        return NextResponse.json({ items: rentals, nextCursor });

    } catch (error: any) {
        console.error("API ERROR [GET /api/rentals]:", error.message);
        return NextResponse.json({ success: false, message: "Failed to fetch rentals" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            id, userId, name, desc, rentalImg,
            rentalImages, coverImg, gallery,
            categoryId, subCategoryId, subCategoryIds,
            customCategoryName,
            price, priceType, stock, radiusKm,
            latitude, longitude, addressLine1, addressLine2, city, state, pincode,
            itemCondition, securityDeposit, minDuration, rentalMode
        } = body;

        if (!userId || !name || !rentalImg || price === undefined || !categoryId) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const finalSubId = subCategoryId || (Array.isArray(subCategoryIds) && subCategoryIds.length > 0 ? subCategoryIds[0] : null);
        const numericPrice = parseFloat(price);

        // ✅ SAFETY CHECK: Force priceType to only be one of the 4 allowed enums from your schema
        let selectedPriceType = priceType ? priceType.toUpperCase() : 'DAILY';
        if (!['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'].includes(selectedPriceType)) {
            selectedPriceType = 'DAILY'; // Fallback so Prisma doesn't crash
        }

        const formattedCondition = itemCondition ? itemCondition.toUpperCase() : 'GOOD';
        const formattedMode = rentalMode ? rentalMode.toUpperCase() : 'PICKUP';

        const dataPayload: any = {
            name, desc, rentalImg,
            rentalImages: rentalImages || [],
            coverImg, gallery: gallery || [],
            price: numericPrice,
            priceType: selectedPriceType, // Guaranteed to match your schema now
            hourlyPrice: selectedPriceType === 'HOURLY' ? numericPrice : undefined,
            dailyPrice: selectedPriceType === 'DAILY' ? numericPrice : undefined,
            weeklyPrice: selectedPriceType === 'WEEKLY' ? numericPrice : undefined,
            monthlyPrice: selectedPriceType === 'MONTHLY' ? numericPrice : undefined,
            stock: parseInt(stock) || 1,
            radiusKm: parseInt(radiusKm) || 10,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            addressLine1, addressLine2, city, state, pincode,
            itemCondition: formattedCondition,
            securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
            minDuration,
            rentalMode: formattedMode,

            // Save custom category correctly
            customCategory: categoryId === 'OTHER' ? customCategoryName : null
        };

        if (categoryId && categoryId !== 'OTHER') {
            dataPayload.category = { connect: { id: categoryId } };
        }

        if (finalSubId && categoryId !== 'OTHER') {
            dataPayload.subcategory = { connect: { id: finalSubId } };
        }

        let rental;
        if (id) {
            rental = await prisma.rental.update({ where: { id }, data: dataPayload });
        } else {
            rental = await prisma.rental.create({
                data: {
                    user: { connect: { id: userId } },
                    ...dataPayload
                }
            });
        }

        return NextResponse.json({ success: true, rental });

    } catch (error: any) {
        console.error("Error saving rental:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}