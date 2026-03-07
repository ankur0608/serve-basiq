"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitServiceReview(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "You must be logged in to post a review." };
    }

    try {
        const serviceId = formData.get("serviceId") as string;
        const rating = Number(formData.get("rating"));
        const comment = formData.get("comment") as string;

        // 1. Verify the user actually booked and completed this service
        const booking = await prisma.booking.findFirst({
            where: {
                userId: session.user.id,
                serviceId: serviceId,
                status: "COMPLETED",
            },
            include: {
                service: true,
            }
        });

        if (!booking || !booking.service) {
            return {
                success: false,
                error: "You can only review services you have booked and completed."
            };
        }

        // 🚀 2. Parse the lightweight JSON string of URLs sent from the frontend!
        // No more buffers, no more heavy RAM usage, no more OOM errors.
        const imagesJson = formData.get("images") as string;
        let uploadedImageUrls: string[] = [];

        try {
            // Safely parse the JSON string back into a TypeScript array
            uploadedImageUrls = imagesJson ? JSON.parse(imagesJson) : [];
        } catch (parseError) {
            console.error("Failed to parse image URLs:", parseError);
            uploadedImageUrls = [];
        }

        // 3. Database Transaction: Create review and update service rating instantly
        await prisma.$transaction(async (tx) => {
            await tx.review.create({
                data: {
                    rating,
                    comment,
                    serviceId,
                    authorId: session.user.id,
                    userId: booking.service.userId,
                    images: uploadedImageUrls, // Instantly save the string array!
                },
            });

            const avgData = await tx.review.aggregate({
                where: { serviceId },
                _avg: { rating: true },
            });

            await tx.service.update({
                where: { id: serviceId },
                data: { rating: avgData._avg.rating || rating },
            });
        }, {
            maxWait: 5000,
            timeout: 10000
        });

        // 4. Update the UI
        revalidatePath(`/services/${serviceId}`);
        return { success: true };

    } catch (error: any) {
        console.error("🔥 [Action] ERROR:", error);
        return { success: false, error: "Failed to submit review. Please try again." };
    }
}