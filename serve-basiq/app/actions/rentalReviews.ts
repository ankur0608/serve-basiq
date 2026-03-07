"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// ❌ Removed generateR2UploadUrl because the frontend handles uploads now!

export async function submitRentalReview(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "You must be logged in." };
        }

        const rentalId = (formData.get("rentalId") || formData.get("serviceId")) as string;
        const rating = parseInt(formData.get("rating") as string);
        const comment = formData.get("comment") as string;
        const authorId = session.user.id;

        if (!rentalId || !rating) {
            return { success: false, error: "Missing required fields." };
        }

        const rental = await prisma.rental.findUnique({
            where: { id: rentalId },
            select: { userId: true }
        });

        if (!rental) {
            return { success: false, error: "Rental not found." };
        }

        // 🚀 1. Parse the lightweight JSON string of URLs sent from the frontend!
        // No more buffers, no more heavy RAM usage, no more server timeouts.
        const imagesJson = formData.get("images") as string;

        let uploadedImageUrls: string[] = [];
        try {
            // Safely parse the JSON string back into a TypeScript array
            uploadedImageUrls = imagesJson ? JSON.parse(imagesJson) : [];
        } catch (parseError) {
            console.error("Failed to parse image URLs:", parseError);
            uploadedImageUrls = [];
        }

        // 🚀 2. Instantly save the URLs to the database
        await prisma.review.create({
            data: {
                rating,
                comment,
                rentalId: rentalId,
                authorId: authorId,
                userId: rental.userId,
                images: uploadedImageUrls // Prisma handles string[] perfectly!
            },
        });

        // 3. Revalidate the cache to show the new review instantly
        revalidatePath(`/rentals/${rentalId}`);

        return { success: true };

    } catch (error) {
        console.error("🔥 [Action] Rental Review Error:", error);
        return { success: false, error: "Failed to submit review." };
    }
}