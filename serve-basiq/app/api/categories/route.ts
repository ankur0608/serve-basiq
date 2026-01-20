import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategoryType } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // 1. Get the type param from URL (e.g., /api/categories?type=SERVICE)
        const { searchParams } = new URL(req.url);
        const typeParam = searchParams.get('type');

        let whereClause = {};

        // 2. If a type is requested, filter by that Type OR 'BOTH'
        if (typeParam) {
            // Ensure uppercase to match Enum
            const type = typeParam.toUpperCase() as CategoryType;
            whereClause = {
                OR: [
                    { type: type },
                    { type: 'BOTH' }
                ]
            };
        }

        const categories = await prisma.category.findMany({
            where: whereClause,
            select: { id: true, name: true }, // Fetch only what we need
            orderBy: { name: 'asc' }          // Alphabetical order is better for dropdowns
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Categories fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}