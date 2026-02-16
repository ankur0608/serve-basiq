"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitProductReview(formData: FormData) {
    console.log("🔥 [SERVER ACTION] submitProductReview started");

    try {
        // 1. Validate Session
        const session = await getServerSession(authOptions);
        console.log("👤 [SERVER ACTION] Session User:", session?.user?.id);

        if (!session?.user?.id) {
            console.error("❌ [SERVER ACTION] Error: User not logged in");
            return { success: false, error: "You must be logged in." };
        }

        // 2. Extract Data
        const productId = formData.get("serviceId") as string;
        const ratingString = formData.get("rating") as string;
        const rating = parseInt(ratingString);
        const comment = formData.get("comment") as string;
        const authorId = session.user.id;

        console.log("📦 [SERVER ACTION] Payload:", { productId, rating, comment, authorId });

        if (!productId || !rating) {
            console.error("❌ [SERVER ACTION] Error: Missing productId or rating");
            return { success: false, error: "Missing required fields." };
        }

        // 3. Fetch Product Owner (REQUIRED by Schema)
        console.log("🔍 [SERVER ACTION] Fetching product owner for ID:", productId);
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { userId: true }
        });

        if (!product) {
            console.error("❌ [SERVER ACTION] Error: Product not found in DB");
            return { success: false, error: "Product not found." };
        }

        console.log("✅ [SERVER ACTION] Product Found. Owner ID:", product.userId);

        // 4. Create Review
        console.log("💾 [SERVER ACTION] Attempting to create review in Prisma...");
        const newReview = await prisma.review.create({
            data: {
                rating,
                comment,
                productId: productId,
                authorId: authorId,    // The Buyer
                userId: product.userId, // The Seller (REQUIRED)
                images: []
            },
        });

        console.log("🎉 [SERVER ACTION] Review Created Successfully:", newReview.id);

        // 5. Revalidate
        revalidatePath(`/products/${productId}`);
        console.log("🔄 [SERVER ACTION] Revalidated path:", `/products/${productId}`);

        return { success: true };

    } catch (error) {
        console.error("💥 [SERVER ACTION] CRITICAL ERROR:", error);
        return { success: false, error: "Failed to submit review." };
    }
}