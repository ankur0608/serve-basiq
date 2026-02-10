import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// ✅ GET: Fetch Services (Not Rentals)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");
        const limit = searchParams.get("limit");

        const where: any = {};

        if (userId) where.userId = userId;
        if (categoryId) where.categoryId = categoryId;

        const services = await prisma.service.findMany({
            where,
            include: {
                category: { select: { name: true } },
                subcategory: { select: { id: true, name: true } },
                user: {
                    select: {
                        id: true, name: true, image: true, phone: true,
                        isVerified: true, shopName: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: limit ? parseInt(limit) : undefined,
        });

        return NextResponse.json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch services" }, { status: 500 });
    }
}

// ✅ POST: Create/Update Service (Removed Rental Logic)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("📥 [Service API] Received Body:", body);

        const {
            id,
            userId,
            name,
            desc,
            serviceimg, // ✅ Specific to Service
            coverImg,
            gallery,
            categoryId,
            subCategoryId,
            subCategoryIds,
            price,
            priceType,

            // ✅ Service Specific Fields
            experience,
            workingDays,
            openTime,
            closeTime,
            altPhone,

            // Location
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
            console.error("❌ Missing Fields:", { userId, name, serviceimg, price });
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const finalSubId = subCategoryId || (Array.isArray(subCategoryIds) ? subCategoryIds[0] : null);

        // Prepare Data Payload
        const dataPayload = {
            name,
            desc,
            serviceimg, // ✅ Saving Service Image
            coverImg,
            gallery,
            price: parseFloat(price),
            priceType: priceType || 'FIXED',

            experience: experience ? parseInt(experience) : 0,

            // Location
            radiusKm: parseInt(radiusKm),
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            addressLine1, addressLine2, city, state, pincode,

            // Contact & Timings
            altPhone,
            workingDays: workingDays || [],
            openTime,
            closeTime,

            // Relations
            category: categoryId ? { connect: { id: categoryId } } : undefined,
            subcategory: finalSubId ? { connect: { id: finalSubId } } : undefined,
        };

        let service;

        if (id) {
            // ✅ UPDATE Service
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
                    // Defaults
                    radiusKm: parseInt(radiusKm) || 10,
                }
            });
        }

        return NextResponse.json({ success: true, service });

    } catch (error: any) {
        console.error("🔥 Error saving service:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}