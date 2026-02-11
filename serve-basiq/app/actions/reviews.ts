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

        // 1. Fetch Booking AND Service Owner ID
        const booking = await prisma.booking.findFirst({
            where: {
                userId: session.user.id,
                serviceId: serviceId,
                status: "COMPLETED",
            },
            include: {
                service: true, // Needed to get the Provider's ID
            }
        });

        if (!booking || !booking.service) {
            return {
                success: false,
                error: "You can only review services you have booked and completed."
            };
        }

        const files = formData.getAll("images") as File[];
        const uploadedImageUrls: string[] = [];

        // 2. Upload Images (Upload happens BEFORE transaction to keep DB lock time short)
        if (files && files.length > 0) {
            for (const file of files) {
                if (!file || file.size === 0) continue;
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[()]/g, '');
                const key = `uploads/reviews/${Date.now()}-${sanitizedFileName}`;
                const url = await uploadToR2(key, buffer, file.type);
                if (url) uploadedImageUrls.push(url);
            }
        }

        // 3. Database Transaction with INCREASED TIMEOUTS
        await prisma.$transaction(async (tx) => {
            // Create Review
            await tx.review.create({
                data: {
                    rating,
                    comment,
                    serviceId,
                    authorId: session.user.id,
                    userId: booking.service.userId, // The Service Provider ID
                    images: uploadedImageUrls,
                },
            });

            // Recalculate Average
            const avgData = await tx.review.aggregate({
                where: { serviceId },
                _avg: { rating: true },
            });

            // Update Service
            await tx.service.update({
                where: { id: serviceId },
                data: { rating: avgData._avg.rating || rating },
            });
        }, {
            maxWait: 5000, // Wait max 5s for a connection
            timeout: 10000 // Allow transaction to run for 10s
        });

        revalidatePath(`/services/${serviceId}`);
        return { success: true };

    } catch (error: any) {
        console.error("🔥 [Action] ERROR:", error);
        return { success: false, error: "Failed to submit review. Please try again." };
    }
}