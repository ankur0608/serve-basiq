"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadToR2 } from "@/lib/r2";

export async function submitServiceReview(formData: FormData) {
    console.log("🚀 [Action] submitServiceReview started");

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "You must be logged in to post a review." };
    }

    try {
        const serviceId = formData.get("serviceId") as string;
        const rating = Number(formData.get("rating"));
        const comment = formData.get("comment") as string;

        // 1. Validation: Ensure User Booked the Service
        const booking = await prisma.booking.findFirst({
            where: {
                userId: session.user.id,
                serviceId: serviceId,
                status: "COMPLETED", // Only completed bookings can be reviewed
            },
            include: {
                service: true,
            }
        });

        // NOTE: For testing, you might comment this check out, but keep it for production!
        if (!booking || !booking.service) {
            return {
                success: false,
                error: "You can only review services you have booked and completed."
            };
        }

        // 2. Handle Image Uploads
        const files = formData.getAll("images") as File[];
        const uploadedImageUrls: string[] = [];

        if (files && files.length > 0) {
            console.log(`📸 [Action] Processing ${files.length} images...`);

            for (const file of files) {
                if (!file || file.size === 0) continue;

                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Sanitize filename
                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");

                // ✅ STORE IN 'reviews/' FOLDER
                const key = `reviews/${timestamp}-${safeName}`;

                // Upload to R2
                const url = await uploadToR2(key, buffer, file.type);
                if (url) uploadedImageUrls.push(url);
            }
        }

        // 3. Database Transaction
        await prisma.$transaction(async (tx) => {
            // Create the Review
            await tx.review.create({
                data: {
                    rating,
                    comment,
                    serviceId,
                    authorId: session.user.id,
                    userId: booking.service.userId, // Link to Provider
                    images: uploadedImageUrls, // ✅ Store URLs in DB
                },
            });

            // Calculate New Average Rating
            const avgData = await tx.review.aggregate({
                where: { serviceId },
                _avg: { rating: true },
            });

            // Update Service with New Rating
            await tx.service.update({
                where: { id: serviceId },
                data: { rating: avgData._avg.rating || rating },
            });
        }, {
            maxWait: 5000,
            timeout: 10000
        });

        revalidatePath(`/services/${serviceId}`);
        return { success: true };

    } catch (error: any) {
        console.error("🔥 [Action] ERROR:", error);
        return { success: false, error: "Failed to submit review. Please try again." };
    }
}