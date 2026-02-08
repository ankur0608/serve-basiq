import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id"); // ✅ Support Single ID fetch
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const limit = searchParams.get("limit");

        const where: any = {};

        if (id) where.id = id; // ✅ Prioritize ID
        if (userId) where.userId = userId;
        if (categoryId) where.categoryId = categoryId;

        if (id) {
            // Fetch Single Rental
            const rental = await prisma.rental.findUnique({
                where: { id },
                include: {
                    category: { select: { name: true } },
                    subcategory: { select: { id: true, name: true } },
                    user: {
                        select: {
                            id: true, name: true, image: true, phone: true,
                            isVerified: true, shopName: true
                        }
                    },
                }
            });
            return NextResponse.json(rental);
        }

        // Fetch List
        const rentals = await prisma.rental.findMany({
            where,
            include: {
                category: { select: { name: true } },
                subcategory: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: limit ? parseInt(limit) : undefined,
        });

        return NextResponse.json(rentals);
    } catch (error) {
        console.error("Error fetching rentals:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Destructure all fields including new ones
        const {
            id, userId, name, desc, rentalImg, coverImg, gallery,
            categoryId, subCategoryId, subCategoryIds,
            price, priceType, stock, radiusKm,
            latitude, longitude, addressLine1, addressLine2, city, state, pincode,
            // ✅ New Rental Fields
            itemCondition, securityDeposit, minDuration, maxDuration, rentalMode
        } = body;

        if (!userId || !name || !rentalImg || !price) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
        }

        const finalSubId = subCategoryId || (Array.isArray(subCategoryIds) ? subCategoryIds[0] : null);

        const dataPayload = {
            name, desc, rentalImg, coverImg, gallery,
            price: parseFloat(price),
            priceType: priceType || 'DAILY',
            stock: parseInt(stock),
            radiusKm: parseInt(radiusKm),
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            addressLine1, addressLine2, city, state, pincode,
            // Relations
            category: categoryId ? { connect: { id: categoryId } } : undefined,
            subcategory: finalSubId ? { connect: { id: finalSubId } } : undefined,
            // ✅ New Fields
            itemCondition,
            securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
            minDuration,
            maxDuration,
            rentalMode
        };

        let rental;
        if (id) {
            rental = await prisma.rental.update({
                where: { id },
                data: dataPayload
            });
        } else {
            rental = await prisma.rental.create({
                data: {
                    user: { connect: { id: userId } },
                    ...dataPayload,
                    // Defaults if missing
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