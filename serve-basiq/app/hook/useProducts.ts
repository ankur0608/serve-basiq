import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ProductProps {
    id: string;
    name: string;
    category: string;
    categoryObject?: any;
    subcategory?: { id: string; name: string } | null;
    price: number;
    moq: number;
    unit: string;
    productImage: string; // ✅ Added back
    productImages: string[]; // ✅ Kept array
    supplier: string;
    isVerified: boolean;
    desc: string;
    gallery: string[];
    stockStatus: string;
    deliveryType: string;
    condition: string;
}

const fetchProductsFn = async (userId?: string): Promise<ProductProps[]> => {
    const endpoint = userId ? '/api/provider/products' : '/api/products/all';

    const options: RequestInit = userId
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        }
        : {
            method: 'GET',
            cache: 'no-store',
        };

    const res = await fetch(endpoint, options);
    if (!res.ok) throw new Error(`HTTP Status: ${res.status}`);

    const rawData = await res.json();
    let items: any[] = [];

    if (Array.isArray(rawData)) items = rawData;
    else if (rawData.data && Array.isArray(rawData.data)) items = rawData.data;
    else if (rawData.products && Array.isArray(rawData.products)) items = rawData.products;

    return items.map((item: any) => ({
        ...item,
        id: String(item.id),
        name: item.name || "Untitled Product",

        category: typeof item.category === 'object' ? item.category?.name : (item.category || "General"),
        categoryObject: item.category,

        subcategory: item.subcategory || null,

        price: Number(item.price) || 0,
        moq: Number(item.moq) || 1,
        unit: item.unit || 'PIECE',

        // ✅ Extract correctly for both fields
        productImage: item.productImage || (item.productImages?.length > 0 ? item.productImages[0] : ""),
        productImages: item.productImages?.length > 0 ? item.productImages : (item.productImage ? [item.productImage] : []),

        supplier: item.user?.shopName || item.user?.name || "Verified Supplier",
        isVerified: Boolean(item.isVerified),
        desc: item.desc || "",
        gallery: item.gallery || [],
        stockStatus: item.stockStatus || "IN_STOCK",
        deliveryType: item.deliveryType || "DELIVERY",
        condition: item.condition || "NEW"
    }));
};

export const useProducts = (userId?: string) => {
    const queryClient = useQueryClient();
    const queryKey = ['products', userId];

    const { data: products = [], isLoading, error } = useQuery({
        queryKey: queryKey,
        queryFn: () => fetchProductsFn(userId),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    const saveMutation = useMutation({
        mutationFn: async (productData: any) => {
            const isEditing = !!productData.id;

            const endpoint = isEditing
                ? `/api/products/${productData.id}`
                : '/api/products/create';

            const method = isEditing ? 'PATCH' : 'POST';

            const payload = {
                userId,
                ...productData,
                subCategoryId: typeof productData.subcategory === 'object'
                    ? productData.subcategory?.id
                    : productData.subCategoryId
            };

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to save product");
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) throw new Error("Failed to delete product");
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return {
        products,
        loading: isLoading,
        error,
        saveProduct: saveMutation.mutateAsync,
        deleteProduct: deleteMutation.mutateAsync,
        isSaving: saveMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};