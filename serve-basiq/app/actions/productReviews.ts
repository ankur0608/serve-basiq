"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitProductReview(formData: FormData) {
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

        const imagesJson = formData.get("images") as string;
        const uploadedImageUrls: string[] = imagesJson ? JSON.parse(imagesJson) : [];

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