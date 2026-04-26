import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteR2Files } from "@/lib/r2";

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

        return NextResponse.json(
            { items: rentals, nextCursor },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            }
        );

    } catch (error: any) {
        console.error("API ERROR [GET /api/rentals]:", error.message);
        return NextResponse.json({ success: false, message: "Failed to fetch rentals" }, { status: 500 });
    }
}

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();

//         const {
//             id, userId, name, desc, rentalImg,
//             rentalImages, coverImg, gallery,
//             categoryId, subCategoryId, subCategoryIds,
//             customCategoryName,
//             price, priceType, stock, radiusKm,
//             latitude, longitude, addressLine1, addressLine2, city, state, pincode,
//             itemCondition, securityDeposit, minDuration, rentalMode
//         } = body;

//         if (!userId || !name || !rentalImg || price === undefined || !categoryId) {
//             return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
//         }

//         const finalSubId = subCategoryId || (Array.isArray(subCategoryIds) && subCategoryIds.length > 0 ? subCategoryIds[0] : null);
//         const numericPrice = parseFloat(price);

//         // ✅ ADDED 'QUOTE' TO ALLOWED ARRAY
//         let selectedPriceType = priceType ? priceType.toUpperCase() : 'DAILY';
//         if (!['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUOTE'].includes(selectedPriceType)) {
//             selectedPriceType = 'DAILY';
//         }

//         const formattedCondition = itemCondition ? itemCondition.toUpperCase() : 'GOOD';
//         const formattedMode = rentalMode ? rentalMode.toUpperCase() : 'PICKUP';

//         const dataPayload: any = {
//             name, desc, rentalImg,
//             rentalImages: rentalImages || [],
//             coverImg, gallery: gallery || [],
//             price: numericPrice,
//             priceType: selectedPriceType,
//             hourlyPrice: selectedPriceType === 'HOURLY' ? numericPrice : undefined,
//             dailyPrice: selectedPriceType === 'DAILY' ? numericPrice : undefined,
//             weeklyPrice: selectedPriceType === 'WEEKLY' ? numericPrice : undefined,
//             monthlyPrice: selectedPriceType === 'MONTHLY' ? numericPrice : undefined,
//             stock: parseInt(stock) || 1,
//             radiusKm: parseInt(radiusKm) || 10,
//             latitude: latitude ? parseFloat(latitude) : null,
//             longitude: longitude ? parseFloat(longitude) : null,
//             addressLine1, addressLine2, city, state, pincode,
//             itemCondition: formattedCondition,
//             securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
//             minDuration,
//             rentalMode: formattedMode,

//             customCategory: categoryId === 'OTHER' ? customCategoryName : null
//         };

//         if (categoryId && categoryId !== 'OTHER') {
//             dataPayload.category = { connect: { id: categoryId } };
//         }

//         if (finalSubId && categoryId !== 'OTHER') {
//             dataPayload.subcategory = { connect: { id: finalSubId } };
//         }

//         let rental;
//         if (id) {
//             rental = await prisma.rental.update({ where: { id }, data: dataPayload });
//         } else {
//             rental = await prisma.rental.create({
//                 data: {
//                     user: { connect: { id: userId } },
//                     ...dataPayload
//                 }
//             });
//         }

//         return NextResponse.json({ success: true, rental });

//     } catch (error: any) {
//         console.error("Error saving rental:", error);
//         return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//     }
// }

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
            itemCondition, securityDeposit, minDuration, rentalMode,
            isAvailable, slots
        } = body;

        if (!userId || !name || !rentalImg || price === undefined || !categoryId) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const finalSubId = subCategoryId || (Array.isArray(subCategoryIds) && subCategoryIds.length > 0 ? subCategoryIds[0] : null);
        const numericPrice = parseFloat(price);

        // Allow 'QUOTE' in addition to standard types
        let selectedPriceType = priceType ? priceType.toUpperCase() : 'DAILY';
        if (!['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUOTE'].includes(selectedPriceType)) {
            selectedPriceType = 'DAILY';
        }

        const formattedCondition = itemCondition ? itemCondition.toUpperCase() : 'GOOD';
        const formattedMode = rentalMode ? rentalMode.toUpperCase() : 'PICKUP';

        const dataPayload: any = {
            name, desc, rentalImg,
            rentalImages: rentalImages || [],
            coverImg, gallery: gallery || [],
            price: numericPrice,
            priceType: selectedPriceType,
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
            isAvailable: typeof isAvailable === 'boolean' ? isAvailable : true,

            customCategory: categoryId === 'OTHER' ? customCategoryName : null
        };

        if (categoryId && categoryId !== 'OTHER') {
            dataPayload.category = { connect: { id: categoryId } };
        }

        if (finalSubId && categoryId !== 'OTHER') {
            dataPayload.subcategory = { connect: { id: finalSubId } };
        }

        let rental;
        let urlsToDelete: string[] = [];

        // ---------------------------------------------------------
        // HANDLE UPDATE (Diff old vs new images)
        // ---------------------------------------------------------
        if (id) {
            console.log(`🔍 [Rental API] Fetching existing rental id: ${id} to check for deleted media...`);
            const existingRental = await prisma.rental.findUnique({
                where: { id },
                select: { 
                    rentalImg: true, 
                    coverImg: true, 
                    gallery: true, 
                    rentalImages: true 
                }
            });

            if (existingRental) {
                // Flatten old URLs
                const oldUrls = [
                    existingRental.rentalImg,
                    existingRental.coverImg,
                    ...(Array.isArray(existingRental.gallery) ? existingRental.gallery : []),
                    ...(Array.isArray(existingRental.rentalImages) ? existingRental.rentalImages : [])
                ].filter(Boolean) as string[];

                // Flatten new URLs from payload
                const newUrls = [
                    rentalImg,
                    coverImg,
                    ...(Array.isArray(gallery) ? gallery : []),
                    ...(Array.isArray(rentalImages) ? rentalImages : [])
                ].filter(Boolean) as string[];

                // Find the difference
                urlsToDelete = oldUrls.filter(oldUrl => !newUrls.includes(oldUrl));
                
                if (urlsToDelete.length > 0) {
                    console.log(`📸 [Rental API] Found ${urlsToDelete.length} orphaned media files to delete.`, urlsToDelete);
                }
            }

            // Update Database
            console.log(`💥 [Rental API] Updating database record...`);
            rental = await prisma.rental.update({ where: { id }, data: dataPayload });

        // ---------------------------------------------------------
        // HANDLE CREATE (No diff needed)
        // ---------------------------------------------------------
        } else {
            console.log(`💥 [Rental API] Creating new database record...`);
            rental = await prisma.rental.create({
                data: {
                    user: { connect: { id: userId } },
                    ...dataPayload
                }
            });
        }

        // ---------------------------------------------------------
        // SLOTS: bulk-insert any new slots supplied by the provider
        // Each item: { date: ISO, startTime: "HH:MM", endTime: "HH:MM" }
        // Existing slots are preserved; use the dedicated slot API to remove.
        // ---------------------------------------------------------
        if (Array.isArray(slots) && slots.length > 0 && rental?.id) {
            const sanitized = slots
                .filter((s: any) => s?.date && s?.startTime && s?.endTime)
                .map((s: any) => ({
                    rentalId: rental.id,
                    date: new Date(s.date),
                    startTime: s.startTime,
                    endTime: s.endTime,
                }));

            if (sanitized.length > 0) {
                await prisma.rentalSlot.createMany({ data: sanitized });
            }
        }

        // ---------------------------------------------------------
        // CLEANUP R2 (Run after DB success)
        // ---------------------------------------------------------
        if (urlsToDelete.length > 0) {
            console.log(`🗑️ [Rental API] Sending URLs to R2 deletion script...`);
            await deleteR2Files(urlsToDelete);
            console.log("✅ [Rental API] R2 cleanup completed.");
        }

        console.log("🎉 [Rental API] Successfully processed Rental.");
        return NextResponse.json({ success: true, rental });

    } catch (error: any) {
        console.error("🔥 Error saving rental:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}