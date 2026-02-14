import { prisma } from "@/lib/prisma";
import { Prisma, CategoryType } from "@prisma/client";

export type CategoryResponse = {
    id: string;
    name: string;
    image: string | null;
    type: CategoryType | null;
    children: {
        id: string;
        name: string;
        image: string | null;
    }[];
};

export async function getRootCategoriesPaginated(
    type: CategoryType | null,
    page = 1,
    limit = 20
) {
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
        parentId: null,
        ...(type && {
            OR: [{ type }, { type: CategoryType.BOTH }],
        }),
    };

    const [data, total] = await prisma.$transaction([
        prisma.category.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                image: true,
                type: true,
            },
        }),
        prisma.category.count({ where }),
    ]);

    return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}
