"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitServiceReview(serviceId: string, rating: number, comment: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "You must be logged in to post a review." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create the new review
            await tx.review.create({
                data: {
                    rating: rating,
                    comment: comment,
                    serviceId: serviceId,
                    authorId: session.user.id,
                },
            });

            // 2. Calculate the new average rating for this service
            const avgData = await tx.review.aggregate({
                where: { serviceId },
                _avg: { rating: true },
            });

            // 3. Update the Service record with the new average
            await tx.service.update({
                where: { id: serviceId },
                data: { rating: avgData._avg.rating || rating },
            });
        });

        revalidatePath(`/services/${serviceId}`);
        return { success: true };
    } catch (error) {
        console.error("Review Error:", error);
        return { success: false, error: "Failed to submit review." };
    }
}