import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteR2Files } from "@/lib/r2";
export const dynamic = 'force-dynamic';

const userSelect = {
    id: true,
    name: true,
    profileImage: true,
    shopName: true,
    isVerified: true,
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam) : undefined;

        const whereClause = userId ? { userId: userId } : { isVerified: true };

        const [services, rentals] = await Promise.all([
            prisma.service.findMany({
                where: whereClause,
                take: limit,
                include: {
                    category: { select: { id: true, name: true } },
                    subcategory: { select: { id: true, name: true } },
                    user: { select: userSelect },
                    _count: { select: { reviews: true } }
                },
                orderBy: { createdAt: 'desc' },
            }),

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

        return NextResponse.json({ services: services || [], rentals: rentals || [] });
    } catch (error: any) {
        console.error("GET Provider Services Error:", error);
        return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const payload = await req.json();
        console.log("📥 [DELETE API] Received request payload:", payload);

        const { userId, id, type } = payload;

        if (!userId || !id || !type) {
            console.warn("⚠️ [DELETE API] Missing required fields.");
            return NextResponse.json({ error: "Missing required fields (userId, id, or type)" }, { status: 400 });
        }

        let urlsToDelete: string[] = [];

        // ---------------------------------------------------------
        // 1. Fetch the existing record to get ALL media URLs
        // ---------------------------------------------------------
        if (type === 'RENTAL') {
            console.log(`🔍 [DELETE API] Fetching RENTAL record for id: ${id}`);
            const rental = await prisma.rental.findUnique({
                where: { id, userId },
                select: { 
                    rentalImg: true, 
                    coverImg: true,
                    gallery: true,
                    rentalImages: true
                } 
            });
            
            if (rental) {
                 urlsToDelete = [
                     rental.rentalImg, 
                     rental.coverImg,
                     ...(Array.isArray(rental.gallery) ? rental.gallery : []), 
                     ...(Array.isArray(rental.rentalImages) ? rental.rentalImages : [])
                 ].filter(Boolean) as string[]; 
                 console.log("📸 [DELETE API] Found RENTAL media to delete:", urlsToDelete);
            } else {
                 console.log("⚠️ [DELETE API] RENTAL record not found in DB.");
            }
        } else {
            console.log(`🔍 [DELETE API] Fetching SERVICE record for id: ${id}`);
            const service = await prisma.service.findUnique({
                where: { id, userId },
                select: { 
                    serviceimg: true,
                    coverImg: true, 
                    mainimg: true,
                    gallery: true, 
                    serviceImages: true
                } 
            });
            
            if (service) {
                 urlsToDelete = [
                     service.serviceimg,
                     service.coverImg, 
                     service.mainimg,
                     ...(Array.isArray(service.gallery) ? service.gallery : []), 
                     ...(Array.isArray(service.serviceImages) ? service.serviceImages : [])
                 ].filter(Boolean) as string[];
                 console.log("📸 [DELETE API] Found SERVICE media to delete:", urlsToDelete);
            } else {
                 console.log("⚠️ [DELETE API] SERVICE record not found in DB.");
            }
        }

        // ---------------------------------------------------------
        // 2. Delete from R2
        // ---------------------------------------------------------
        if (urlsToDelete.length > 0) {
            console.log(`🗑️ [DELETE API] Sending ${urlsToDelete.length} URLs to R2 deletion script...`);
            await deleteR2Files(urlsToDelete);
            console.log("✅ [DELETE API] R2 deletion step completed.");
        } else {
            console.log("⏭️ [DELETE API] No URLs found to delete from R2. Skipping.");
        }

        // ---------------------------------------------------------
        // 3. Delete from Database (Using Transaction)
        // ---------------------------------------------------------
        console.log(`💥 [DELETE API] Deleting ${type} record and associated data from database...`);
        
        await prisma.$transaction(async (tx) => {
             if (type === 'RENTAL') {
                 // Delete related records
                 await tx.rentalBooking.deleteMany({ where: { rentalId: id } }); 
                 await tx.favoriteRental.deleteMany({ where: { rentalId: id } });
                 await tx.review.deleteMany({ where: { rentalId: id } });
                 
                 // Delete Rental
                 await tx.rental.delete({ where: { id, userId } });
             } else {
                 // Delete related records
                 await tx.booking.deleteMany({ where: { serviceId: id } }); 
                 await tx.favoriteService.deleteMany({ where: { serviceId: id } });
                 await tx.review.deleteMany({ where: { serviceId: id } });
                 
                 // Delete Service
                 await tx.service.delete({ where: { id, userId } });
             }
        }, {
             maxWait: 5000,
             timeout: 30000,
        });

        console.log("🎉 [DELETE API] Successfully deleted database record.");
        return NextResponse.json({ message: "Successfully deleted" });
    } catch (error: any) {
        console.error("❌ [DELETE API] Fatal Error:", error);
        
        if (error.code === 'P2025') {
             return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }
        
        return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
    }
}