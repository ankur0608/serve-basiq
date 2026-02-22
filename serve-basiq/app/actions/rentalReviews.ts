"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadToR2 } from "@/lib/r2"; 

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

        const files = formData.getAll("images") as File[];
        const uploadedImageUrls: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                if (!file || file.size === 0) continue;

                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");

                const key = `reviews/${timestamp}-${safeName}`;

                const url = await uploadToR2(key, buffer, file.type);
                if (url) uploadedImageUrls.push(url);
            }
        }

        await prisma.review.create({
            data: {
                rating,
                comment,
                rentalId: rentalId,
                authorId: authorId,    
                userId: rental.userId, 
                images: uploadedImageUrls 
            },
        });

        revalidatePath(`/rentals/${rentalId}`);

        return { success: true };

    } catch (error) {
        console.error("Rental Review Error:", error);
        return { success: false, error: "Failed to submit review." };
    }
}