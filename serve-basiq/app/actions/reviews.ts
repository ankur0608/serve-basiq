"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadToR2 } from "@/lib/r2";

export async function submitServiceReview(formData: FormData) {
    console.log("🚀 [Action] submitServiceReview started");

    // 1. Get Session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        console.warn("⚠️ [Action] Aborted: User not authenticated");
        return { success: false, error: "You must be logged in to post a review." };
    }
    console.log(`👤 [Action] User Authenticated: ${session.user.id}`);

    try {
        // 2. Extract Data from FormData
        const serviceId = formData.get("serviceId") as string;
        const rating = Number(formData.get("rating"));
        const comment = formData.get("comment") as string;

        console.log(`📝 [Action] Review Data: Service=${serviceId}, Rating=${rating}`);

        // Extract files
        const files = formData.getAll("images") as File[];
        const uploadedImageUrls: string[] = [];

        // 3. Upload Images to R2
        if (files && files.length > 0) {
            console.log(`📂 [Action] Found ${files.length} images to upload`);

            for (const file of files) {
                // Skip invalid files
                if (!file || file.size === 0) continue;

                console.log(`⬆️ [Action] Uploading file: ${file.name} (${file.size} bytes)`);

                // Prepare file for upload
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[()]/g, '');
                const key = `uploads/reviews/${Date.now()}-${sanitizedFileName}`;

                // Upload using your helper
                const url = await uploadToR2(key, buffer, file.type);

                if (url) {
                    console.log(`✅ [Action] Upload success: ${url}`);
                    uploadedImageUrls.push(url);
                } else {
                    console.error(`❌ [Action] Upload returned no URL for ${file.name}`);
                }
            }
        } else {
            console.log("📂 [Action] No images provided, skipping upload.");
        }

        // 4. Database Transaction
        console.log("💾 [Action] Starting Database Transaction...");

        await prisma.$transaction(async (tx) => {
            // A. Create the new review
            const newReview = await tx.review.create({
                data: {
                    rating: rating,
                    comment: comment,
                    serviceId: serviceId,
                    authorId: session.user.id,
                    images: uploadedImageUrls,
                },
            });
            console.log(`✅ [DB] Review created with ID: ${newReview.id}`);

            // B. Calculate the new average rating
            const avgData = await tx.review.aggregate({
                where: { serviceId },
                _avg: { rating: true },
            });
            console.log(`📊 [DB] New Average Rating Calculated: ${avgData._avg.rating}`);

            // C. Update the Service record
            await tx.service.update({
                where: { id: serviceId },
                data: { rating: avgData._avg.rating || rating },
            });
            console.log("🔄 [DB] Service rating updated");
        });

        console.log("🎉 [Action] Review process completed successfully!");
        revalidatePath(`/services/${serviceId}`);
        return { success: true };

    } catch (error: any) {
        console.error("🔥 [Action] CRITICAL ERROR:", error);
        return { success: false, error: "Failed to submit review." };
    }
}