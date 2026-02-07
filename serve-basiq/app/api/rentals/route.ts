import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const limit = searchParams.get("limit");

        const where: any = {};

        if (userId) where.userId = userId;
        if (categoryId) where.categoryId = categoryId;

        const rentals = await prisma.rental.findMany({
            where,
            include: {
                category: { select: { name: true } },
                // ✅ FIXED: Changed 'subcategories' to 'subcategory'
                subcategory: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: limit ? parseInt(limit) : undefined,
        });

        return NextResponse.json(rentals);
    } catch (error) {
        console.error("Error fetching rentals:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch rentals" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            id,
            userId,
            name,
            desc,
            rentalImg,
            coverImg,
            gallery,
            categoryId,
            subCategoryId,
            subCategoryIds,
            price,
            priceType,
            stock,
            radiusKm,
            latitude,
            longitude,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode
        } = body;

        if (!userId || !name || !rentalImg || !price) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // Handle Single Subcategory Relation
        const finalSubId = subCategoryId || (Array.isArray(subCategoryIds) ? subCategoryIds[0] : null);
        const subCategoryRelation = finalSubId ? { connect: { id: finalSubId } } : undefined;
        const categoryRelation = categoryId ? { connect: { id: categoryId } } : undefined;

        let rental;

        // Data payload for UPDATE (userId is not needed here)
        const updatePayload = {
            name,
            desc,
            rentalImg,
            coverImg,
            gallery,
            price: parseFloat(price),
            priceType,
            stock: parseInt(stock),
            radiusKm: parseInt(radiusKm),
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            category: categoryRelation,
            subcategory: subCategoryRelation
        };

        if (id) {
            // ✅ UPDATE
            rental = await prisma.rental.update({
                where: { id },
                data: updatePayload
            });
        } else {
            // ✅ CREATE (FIXED: User connection)
            rental = await prisma.rental.create({
                data: {
                    // Don't pass 'userId' directly here when using relations
                    user: { connect: { id: userId } },
                    ...updatePayload,
                    priceType: priceType || 'DAILY',
                    stock: parseInt(stock) || 1,
                    radiusKm: parseInt(radiusKm) || 10,
                }
            });
        }

        return NextResponse.json({ success: true, rental });

    } catch (error: any) {
        console.error("Error saving rental:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}