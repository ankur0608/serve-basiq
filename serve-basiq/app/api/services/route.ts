import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceSettingsSchema } from "@/lib/validators";

export const dynamic = 'force-dynamic';

// 1. GET: Fetch services
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        
        // ✅ ADD LIMIT LOGIC (Default to 50 if not specified to prevent slow loads)
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : undefined;

        const whereClause = userId ? { userId: userId } : {};

        const services = await prisma.service.findMany({
            where: whereClause,
            // ✅ Apply Limit if provided
            take: limit, 
            include: {
                category: { select: { id: true, name: true } },
                subcategories: { select: { id: true, name: true } },

                user: {
                    select: { 
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
                        },
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(services);
    } catch (error: any) {
        console.error("GET Service Error:", error);
        return NextResponse.json({ error: "Failed to fetch services", details: error.message }, { status: 500 });
    }
}

// 2. POST: Create or Update (Service Data + User Socials)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, serviceId, ...formData } = body;

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized: Missing User ID" }, { status: 401 });
        }

        const data = serviceSettingsSchema.parse(formData);

        // ✅ 1. Service Data (Goes to 'Service' Table)
        const servicePayload = {
            name: data.name,
            desc: data.desc,
            serviceimg: formData.serviceimg || data.mainimg || "",
            mainimg: data.mainimg || formData.serviceimg || "",
            coverImg: data.coverImg || "",
            price: data.price,
            experience: data.experience,
            priceType: data.priceType || "FIXED",

            // Service Specific Address (If different from Provider Address)
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
            altPhone: data.altPhone,
        };

        // ✅ 2. User Data (Goes to 'User' Table - Social Links)
        const userSocialsUpdate = {
            instagramUrl: data.instagramUrl,
            facebookUrl: data.facebookUrl,
            websiteUrl: data.websiteUrl,
            youtubeUrl: data.youtubeUrl,
        };

        const categoryRelation = data.categoryId ? { connect: { id: data.categoryId } } : undefined;
        const subCatsConnect = data.subCategoryIds?.map((id: string) => ({ id })) || [];

        let result;

        if (serviceId) {
            // --- UPDATE EXISTING SERVICE ---
            result = await prisma.service.update({
                where: { id: serviceId },
                data: {
                    ...servicePayload,
                    category: categoryRelation,
                    subcategories: { set: subCatsConnect },

                    // Update User Socials via Nested Update
                    user: {
                        update: userSocialsUpdate
                    }
                },
            });
        } else {
            // --- CREATE NEW SERVICE ---
            result = await prisma.service.create({
                data: {
                    ...servicePayload,
                    category: categoryRelation,
                    subcategories: { connect: subCatsConnect },

                    // Connect to User
                    user: {
                        connect: { id: userId },
                    }
                },
            });

            // Explicitly update user socials after create (since nested connect+update is tricky in some Prisma versions)
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

// 3. DELETE
export async function DELETE(req: Request) {
    try {
        const { userId, serviceId } = await req.json();
        if (!userId || !serviceId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const result = await prisma.service.deleteMany({
            where: { id: serviceId, userId: userId }
        });

        if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json({ success: true, message: "Deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}