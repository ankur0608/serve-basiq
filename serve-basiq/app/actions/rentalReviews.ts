"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadToR2 } from "@/lib/r2";

export async function submitRentalReview(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "You must be logged in." };
    }

    try {
        // Assuming the form passes 'serviceId' prop reused as 'rentalId' 
        // or you updated the form to pass 'rentalId'
        const rentalId = formData.get("serviceId") as string;
        const rating = Number(formData.get("rating"));
        const comment = formData.get("comment") as string;

        // 1. Verify Rental Usage
        // Check if the user has a COMPLETED booking for this rental
        // Adjust 'booking' to 'rentalBooking' if you have a separate table
        const booking = await prisma.booking.findFirst({
            where: {
                userId: session.user.id,
                rentalId: rentalId, // Ensure your Booking model has rentalId
                status: 'COMPLETED', // Or 'RETURNED'
            },
            include: {
                rental: true // 👈 We need this to get the rental.userId (Owner)
            }
        });

        if (!booking || !booking.rental) {
            return { success: false, error: "You must complete a rental to review it." };
        }

        // 2. Upload Images
        const files = formData.getAll("images") as File[];
        const uploadedImageUrls: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                if (!file || file.size === 0) continue;
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const key = `uploads/reviews/rentals/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
                const url = await uploadToR2(key, buffer, file.type);
                if (url) uploadedImageUrls.push(url);
            }
        }

        // 3. Create Review Transaction
        // await prisma.$transaction(async (tx) => {
        //     // Create Review
        //     await tx.review.create({
        //         data: {
        //             rating,
        //             comment,
        //             rentalId,
        //             // ⚠️ IMPORTANT: Pass the Rental Owner ID here
        //             userId: booking.rental.userId,
        //             authorId: session.user.id,
        //             images: uploadedImageUrls,
        //         },
        //     });

        //     // Recalculate Rental Rating
        //     const avgData = await tx.review.aggregate({
        //         where: { rentalId },
        //         _avg: { rating: true },
        //     });

        //     // await tx.rental.update({
        //     //     where: { id: rentalId },
        //     //     data: { rating: avgData._avg.rating || rating },
        //     // });
        // });

        revalidatePath(`/rentals/${rentalId}`);
        return { success: true };

    } catch (error: any) {
        console.error("🔥 Rental Review Error:", error);
        return { success: false, error: "Failed to submit review." };
    }
}