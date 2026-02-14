import { CategoryType } from "@prisma/client";

export function parseCategoryType(
    value: string | null
): CategoryType | null {
    if (!value) return null;

    const normalized = value.toUpperCase();

    return Object.values(CategoryType).includes(
        normalized as CategoryType
    )
        ? (normalized as CategoryType)
        : null;
}
