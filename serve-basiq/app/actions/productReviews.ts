"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadToR2 } from "@/lib/r2";

export async function submitProductReview(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "You must be logged in." };
    }

    try {
        const productId = formData.get("serviceId") as string; // Reusing the prop name from your RatingForm
        const rating = Number(formData.get("rating"));
        const comment = formData.get("comment") as string;

        // 1. Verify Purchase Server-Side to prevent abuse
        // We need to find the order item to get the PRODUCT OWNER (Supplier) ID
        // const orderItem = await prisma.orderItem.findFirst({
        //     where: {
        //         productId: productId,
        //         order: {
        //             userId: session.user.id,
        //             status: 'DELIVERED',
        //         }
        //     },
        //     include: {
        //         product: true // To get supplier ID
        //     }
        // });

        // if (!orderItem || !orderItem.product) {
        //     return { success: false, error: "Verified purchase required." };
        // }

        // 2. Upload Images
        const files = formData.getAll("images") as File[];
        const uploadedImageUrls: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                if (!file || file.size === 0) continue;
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const key = `uploads/reviews/products/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
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
        //             productId,
        //             userId: orderItem.product.userId, // The Supplier ID
        //             authorId: session.user.id,        // The Customer ID
        //             images: uploadedImageUrls,
        //         },
        //     });

        //     // Recalculate Product Rating
        //     const avgData = await tx.review.aggregate({
        //         where: { productId },
        //         _avg: { rating: true },
        //     });

        //     // await tx.product.update({
        //     //     where: { id: productId },
        //     //     data: { rating: avgData._avg.rating || rating },
        //     // });
        // });

        revalidatePath(`/products/${productId}`);
        return { success: true };

    } catch (error: any) {
        console.error("🔥 Product Review Error:", error);
        return { success: false, error: "Failed to submit review." };
    }
}