import { ServiceProps } from '@/components/ui/ServiceCard';

export interface CategoryData {
    id: string;
    name: string;
    image?: string;
    children: { id: string; name: string }[];
}

export interface ExplorerItem extends ServiceProps {
    categoryId?: string | number;
    categoryName: string;
    subcategoryId?: string | number;
    subcategoryName?: string;
    reviewCount?: number;
}