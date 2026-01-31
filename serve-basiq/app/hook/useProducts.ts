import { useState, useCallback } from 'react';

export interface ProductProps {
    id: string;
    name: string;
    category: string; // Used for table display string
    categoryObject?: any; // Stores the full category object for editing
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
    subcategories?: any[]; // Stores the array of subcategory objects
}

export const useProducts = (userId?: string) => {
    const [products, setProducts] = useState<ProductProps[]>([]);
    const [loading, setLoading] = useState(false);

    // --- FETCH PRODUCTS ---
    const fetchProducts = useCallback(async () => {
        const controller = new AbortController();
        const signal = controller.signal;

        setLoading(true);
        try {
            const endpoint = userId ? '/api/provider/products' : '/api/products/all';
            const options: RequestInit = userId
                ? {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                    signal
                }
                : {
                    method: 'GET',
                    cache: 'no-store',
                    signal
                };

            const res = await fetch(endpoint, options);
            if (!res.ok) throw new Error(`HTTP Status: ${res.status}`);

            const rawData = await res.json();

            let items = [];
            if (Array.isArray(rawData)) items = rawData;
            else if (Array.isArray(rawData.data)) items = rawData.data;
            else if (rawData.products && Array.isArray(rawData.products)) items = rawData.products;

            const formatted: ProductProps[] = items.map((item: any) => ({
                // ✅ Fix: Spread 'item' first to preserve category and subcategories objects
                ...item,
                id: String(item.id),
                name: item.name || "Untitled Product",

                // Display logic: extract name for table, but keep object for form
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
            }));

            setProducts(formatted);
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error("Fetch error:", e);
            }
        } finally {
            setLoading(false);
        }

        return () => controller.abort();
    }, [userId]);

    // --- SAVE (CREATE / UPDATE) ---
    const saveProduct = async (productData: any, isEditing: boolean) => {
        if (!userId) return { success: false, error: "Unauthorized" };
        setLoading(true);
        try {
            const endpoint = isEditing ? `/api/products/${productData.id}` : '/api/products/create';
            const method = isEditing ? 'PATCH' : 'POST';
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...productData })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Failed to save");

            await fetchProducts();
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // --- DELETE ---
    const deleteProduct = async (productId: string) => {
        if (!userId) return false;
        try {
            const res = await fetch(`/api/products/${productId}`, { // Standardized to your route params
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== productId));
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return { products, loading, fetchProducts, saveProduct, deleteProduct };
};