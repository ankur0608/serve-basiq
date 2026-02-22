"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitProductReview(formData: FormData) {
    console.log("🔥 [SERVER ACTION] submitProductReview started");

    try {
        // 1. Auth check
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "You must be logged in." };
        }

        // 2. Parse basic fields
        const productId = (formData.get("productId") || formData.get("serviceId")) as string;
        const rating = parseInt(formData.get("rating") as string);
        const comment = formData.get("comment") as string;
        const authorId = session.user.id;

        if (!productId || !rating) {
            return { success: false, error: "Missing required fields." };
        }

        // 3. Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { userId: true }
        });

        if (!product) {
            return { success: false, error: "Product not found." };
        }

        // 4. Parse the Image URLs (The frontend will send a JSON array of string URLs)
        const imagesJson = formData.get("images") as string;
        const uploadedImageUrls: string[] = imagesJson ? JSON.parse(imagesJson) : [];

        console.log(`📸 [Product] Saving ${uploadedImageUrls.length} image URLs to database...`);

        // 5. Save to Prisma instantly (No Buffer/Upload wait time!)
        await prisma.review.create({
            data: {
                rating,
                comment,
                productId: productId,
                authorId: authorId,
                userId: product.userId,
                images: uploadedImageUrls
            },
        });

        // 6. Revalidate cache
        revalidatePath(`/products/${productId}`);

        console.log("✅ [SERVER ACTION] Review saved successfully!");
        return { success: true };

    } catch (error) {
        console.error("💥 [SERVER ACTION] CRITICAL ERROR:", error);
        return { success: false, error: "Failed to submit review." };
    }
}