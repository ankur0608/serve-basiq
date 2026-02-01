import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ProductProps {
    id: string;
    name: string;
    category: string;
    categoryObject?: any;
    price: number;
    moq: number;
    unit: string;
    image: string;
    productImage: string;
    supplier: string;
    isVerified: boolean;
    desc: string;
    gallery: string[];
    stockStatus: string;
    deliveryType: string;
    subcategories?: any[];
}

// --- API FETCH FUNCTION ---
const fetchProductsFn = async (userId?: string) => {
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

    let items = [];
    if (Array.isArray(rawData)) items = rawData;
    else if (Array.isArray(rawData.data)) items = rawData.data;
    else if (rawData.products && Array.isArray(rawData.products)) items = rawData.products;

    // Transform Data
    return items.map((item: any) => ({
        ...item,
        id: String(item.id),
        name: item.name || "Untitled Product",
        category: typeof item.category === 'object' ? item.category?.name : (item.category || "General"),
        categoryObject: item.category,
        price: Number(item.price) || 0,
        moq: Number(item.moq) || 1,
        unit: item.unit || 'PIECE',
        image: item?.productImage || item.image || item.img || "",
        productImage: item?.productImage || item.image || "",
        supplier: item.user?.shopName || item.user?.name || "Verified Supplier",
        isVerified: Boolean(item.isVerified),
        desc: item.desc || "",
        gallery: item.gallery || [],
        stockStatus: item.stockStatus || "IN_STOCK",
        deliveryType: item.deliveryType || "DELIVERY"
    })) as ProductProps[];
};

export const useProducts = (userId?: string) => {
    const queryClient = useQueryClient();
    const queryKey = ['products', userId];

    // --- 1. FETCH QUERY ---
    const { data: products = [], isLoading, error } = useQuery({
        queryKey: queryKey,
        queryFn: () => fetchProductsFn(userId),
        enabled: true, // You can toggle this if userId is required

        // ✅ CRITICAL: This ensures api calls only once and stays fresh indefinitely
        // untill we manually invalidate it.
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    // --- 2. SAVE MUTATION (Create / Update) ---
    const saveMutation = useMutation({
        mutationFn: async (productData: any) => {
            const isEditing = !!productData.id;
            const endpoint = isEditing ? `/api/products/${productData.id}` : '/api/products/create';
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...productData })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Failed to save");
            return data;
        },
        onSuccess: () => {
            // ✅ Trigger Refetch only after successful save
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // --- 3. DELETE MUTATION ---
    const deleteMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (!res.ok) throw new Error("Failed to delete");
            return true;
        },
        onSuccess: () => {
            // ✅ Trigger Refetch only after successful delete
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