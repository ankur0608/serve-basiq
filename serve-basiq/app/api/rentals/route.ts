// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export const dynamic = 'force-dynamic';

// export async function GET(req: Request) {
//     try {
//         const { searchParams } = new URL(req.url);
//         const id = searchParams.get("id");
//         const userId = searchParams.get("userId");
//         const categoryId = searchParams.get("categoryId");
//         const limit = searchParams.get("limit");

//         const where: any = {};

//         if (id) where.id = id;
//         if (userId) where.userId = userId;
//         if (categoryId) where.categoryId = categoryId;

//         // Common include object for reusability
//         const includeObj = {
//             // ✅ FIX 1: Select ID along with Name
//             category: { select: { id: true, name: true } },
//             subcategory: { select: { id: true, name: true } },
//             user: {
//                 select: {
//                     id: true, name: true, image: true, phone: true,
//                     isVerified: true, shopName: true
//                 }
//             }
//         };

//         if (id) {
//             const rental = await prisma.rental.findUnique({
//                 where: { id },
//                 include: includeObj
//             });
//             return NextResponse.json(rental);
//         }

//         const rentals = await prisma.rental.findMany({
//             where,
//             include: includeObj,
//             orderBy: { createdAt: "desc" },
//             take: limit ? parseInt(limit) : undefined,
//         });

//         return NextResponse.json(rentals);
//     } catch (error) {
//         console.error("Error fetching rentals:", error);
//         return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
//     }
// }

// export async function POST(req: Request) {
//     try {
//         const body = await req.json();

//         const {
//             id, userId, name, desc, rentalImg, coverImg, gallery,
//             categoryId, subCategoryId, subCategoryIds, // Input IDs
//             price, priceType, stock, radiusKm,
//             latitude, longitude, addressLine1, addressLine2, city, state, pincode,
//             itemCondition, securityDeposit, minDuration, rentalMode
//         } = body;

//         // ✅ FIX 2: Validate Category is present
//         if (!userId || !name || !rentalImg || !price || !categoryId) {
//             return NextResponse.json({ success: false, message: "Missing required fields (Name, Image, Price, Category)" }, { status: 400 });
//         }

//         const finalSubId = subCategoryId || (Array.isArray(subCategoryIds) && subCategoryIds.length > 0 ? subCategoryIds[0] : null);
//         const numericPrice = parseFloat(price);
//         const selectedPriceType = priceType || 'DAILY';

//         const pricePayload = {
//             price: numericPrice,
//             priceType: selectedPriceType,
//             dailyPrice: selectedPriceType === 'DAILY' ? numericPrice : undefined,
//             monthlyPrice: selectedPriceType === 'MONTHLY' ? numericPrice : undefined,
//             fixedPrice: selectedPriceType === 'FIXED' ? numericPrice : undefined,
//         };

//         const dataPayload = {
//             name, desc, rentalImg, coverImg, gallery,
//             ...pricePayload,
//             stock: parseInt(stock),
//             radiusKm: parseInt(radiusKm),
//             latitude: latitude ? parseFloat(latitude) : null,
//             longitude: longitude ? parseFloat(longitude) : null,
//             addressLine1, addressLine2, city, state, pincode,

//             // ✅ FIX 3: Ensure we don't try to connect empty strings
//             category: categoryId ? { connect: { id: categoryId } } : undefined,
//             subcategory: finalSubId ? { connect: { id: finalSubId } } : undefined,

//             itemCondition,
//             securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
//             minDuration,
//             rentalMode
//         };

//         let rental;
//         if (id) {
//             rental = await prisma.rental.update({
//                 where: { id },
//                 data: dataPayload
//             });
//         } else {
//             rental = await prisma.rental.create({
//                 data: {
//                     user: { connect: { id: userId } },
//                     ...dataPayload,
//                     stock: parseInt(stock) || 1,
//                     radiusKm: parseInt(radiusKm) || 10
//                 }
//             });
//         }

//         return NextResponse.json({ success: true, rental });

//     } catch (error: any) {
//         console.error("Error saving rental:", error);
//         return NextResponse.json({ success: false, message: error.message }, { status: 500 });
//     }
// }


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// --- GET HANDLER ---
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const limit = parseInt(searchParams.get("limit") || "24");
        const cursor = searchParams.get("cursor");

        // Filters
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const subcategoryId = searchParams.get("subcategoryId"); // 👈 Added
        const search = searchParams.get("search");
        const location = searchParams.get("location"); // 👈 Added
        const sort = searchParams.get("sort"); // 👈 Added

        // 🔒 STRICT REQUIREMENT: Verified rentals and users only
        const where: any = {
            isVerified: true,
            user: { isVerified: true }
        };

        if (userId) where.userId = userId;
        if (categoryId) where.categoryId = categoryId;
        if (subcategoryId) where.subCategoryId = subcategoryId;

        // ✅ LOCATION FILTER: Using Address table Work type
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

        // Add Search safely
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

        // --- BUILD PRISMA ORDER BY CLAUSE ---
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
            // Add rating here if added to schema later
        }

        // Include relations
        const includeObj = {
            category: { select: { id: true, name: true } },
            subcategory: { select: { id: true, name: true } },
            _count: { select: { reviews: true } }, // 👈 Needed for sorting popular
            user: {
                select: {
                    id: true, name: true, image: true, phone: true,
                    isVerified: true, shopName: true,
                    // Pull the Work address so frontend can map the location
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

        return NextResponse.json({
            items: rentals,
            nextCursor
        });

    } catch (error) {
        console.error("Error fetching rentals:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
    }
}

// ... POST handler remains completely unchanged ...

// --- POST HANDLER ---
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Destructure body
        const {
            id, userId, name, desc, rentalImg, coverImg, gallery,
            categoryId, subCategoryId, subCategoryIds,
            price, priceType, stock, radiusKm,
            latitude, longitude, addressLine1, addressLine2, city, state, pincode,
            itemCondition, securityDeposit, minDuration, rentalMode
        } = body;

        // Validation
        if (!userId || !name || !rentalImg || !price || !categoryId) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Logic
        const finalSubId = subCategoryId || (Array.isArray(subCategoryIds) && subCategoryIds.length > 0 ? subCategoryIds[0] : null);
        const numericPrice = parseFloat(price);
        const selectedPriceType = priceType || 'DAILY';

        const dataPayload = {
            name, desc, rentalImg, coverImg, gallery,
            price: numericPrice,
            priceType: selectedPriceType,
            dailyPrice: selectedPriceType === 'DAILY' ? numericPrice : undefined,
            monthlyPrice: selectedPriceType === 'MONTHLY' ? numericPrice : undefined,
            fixedPrice: selectedPriceType === 'FIXED' ? numericPrice : undefined,
            stock: parseInt(stock),
            radiusKm: parseInt(radiusKm),
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            addressLine1, addressLine2, city, state, pincode,
            category: categoryId ? { connect: { id: categoryId } } : undefined,
            subcategory: finalSubId ? { connect: { id: finalSubId } } : undefined,
            itemCondition,
            securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
            minDuration,
            rentalMode
        };

        let rental;
        if (id) {
            rental = await prisma.rental.update({ where: { id }, data: dataPayload });
        } else {
            rental = await prisma.rental.create({
                data: {
                    user: { connect: { id: userId } },
                    ...dataPayload,
                    stock: parseInt(stock) || 1,
                    radiusKm: parseInt(radiusKm) || 10
                }
            });
        }

        return NextResponse.json({ success: true, rental });

    } catch (error: any) {
        console.error("Error saving rental:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}