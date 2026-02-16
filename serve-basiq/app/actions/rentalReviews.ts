"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitRentalReview(formData: FormData) {
    try {
        // 1. Validate Session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "You must be logged in." };
        }

        // 2. Extract Data
        const rentalId = formData.get("serviceId") as string; // RatingForm uses "serviceId" as the generic key
        const rating = parseInt(formData.get("rating") as string);
        const comment = formData.get("comment") as string;
        const authorId = session.user.id;

        if (!rentalId || !rating) {
            return { success: false, error: "Missing required fields." };
        }

        // 3. Fetch Rental to get the Owner's ID (userId)
        const rental = await prisma.rental.findUnique({
            where: { id: rentalId },
            select: { userId: true }
        });

        if (!rental) {
            return { success: false, error: "Rental not found." };
        }

        // 4. Create Review
        await prisma.review.create({
            data: {
                rating,
                comment,
                rentalId: rentalId,
                authorId: authorId,    // The Renter
                userId: rental.userId, // The Owner (REQUIRED)
                images: []
            },
        });

        // 5. Revalidate
        revalidatePath(`/rentals/${rentalId}`);

        return { success: true };

    } catch (error) {
        console.error("Rental Review Error:", error);
        return { success: false, error: "Failed to submit review." };
    }
}