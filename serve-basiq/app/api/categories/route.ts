import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CategoryType } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const typeParam = searchParams.get('type');

        let whereClause: any = {
            parentId: null
        };

        if (typeParam) {
            const type = typeParam.toUpperCase() as CategoryType;
            whereClause.AND = [
                {
                    OR: [
                        { type: type },
                        { type: 'BOTH' }
                    ]
                }
            ];
        }

        const categories = await prisma.category.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                image: true,
                type: true,
                // ✅ Fetch 'children' (Subcategories) for the dropdowns
                children: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    },
                    orderBy: { name: 'asc' }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Categories fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}


// import { NextResponse } from "next/server";
// import { parseCategoryType } from "@/lib/validators/category";
// import { getRootCategoriesPaginated } from "@/app/services/category.service";

// export const dynamic = "force-dynamic";

// export async function GET(req: Request) {
//     const start = process.hrtime.bigint(); // high precision timer

//     try {
//         const { searchParams } = new URL(req.url);
//         const typeParam = searchParams.get("type");

//         const type = parseCategoryType(typeParam);

//         const categories = await getRootCategoriesPaginated(type);

//         const end = process.hrtime.bigint();
//         const durationMs = Number(end - start) / 1_000_000;

//         console.log(
//             `[API] GET /api/categories completed in ${durationMs.toFixed(2)} ms`
//         );

//         return NextResponse.json(categories, {
//             status: 200,
//         });
//     } catch (error) {
//         const end = process.hrtime.bigint();
//         const durationMs = Number(end - start) / 1_000_000;

//         console.error(
//             `[API ERROR] GET /api/categories failed in ${durationMs.toFixed(2)} ms`,
//             error
//         );

//         return NextResponse.json(
//             { error: "Failed to fetch categories" },
//             { status: 500 }
//         );
//     }
// }
