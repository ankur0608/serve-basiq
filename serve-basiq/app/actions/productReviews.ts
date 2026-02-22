"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadToR2 } from "@/lib/r2"; 

export async function submitProductReview(formData: FormData) {
    console.log("🔥 [SERVER ACTION] submitProductReview started");

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return { success: false, error: "You must be logged in." };
        }
        const productId = (formData.get("productId") || formData.get("serviceId")) as string;
        const rating = parseInt(formData.get("rating") as string);
        const comment = formData.get("comment") as string;
        const authorId = session.user.id;

        if (!productId || !rating) {
            return { success: false, error: "Missing required fields." };
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { userId: true }
        });

        if (!product) {
            return { success: false, error: "Product not found." };
        }

        const files = formData.getAll("images") as File[];
        const uploadedImageUrls: string[] = [];

        if (files && files.length > 0) {
            console.log(`📸 [Product] Uploading ${files.length} images...`);
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
                productId: productId,
                authorId: authorId,   
                userId: product.userId, 
                images: uploadedImageUrls 
            },
        });

        revalidatePath(`/products/${productId}`);

        return { success: true };

    } catch (error) {
        console.error("💥 [SERVER ACTION] CRITICAL ERROR:", error);
        return { success: false, error: "Failed to submit review." };
    }
}