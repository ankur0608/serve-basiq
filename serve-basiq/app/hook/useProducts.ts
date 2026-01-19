import { useState, useCallback, useEffect } from 'react';

// Define the shape of your Product to include ALL fields needed for editing
export interface ProductProps {
    id: string;
    name: string;
    category: string;
    price: number;
    moq: number;
    unit: string;
    image: string; // Used for UI Card
    productImage: string; // Used for Edit Form
    supplier: string;
    isVerified: boolean;
    // ✅ Added these fields so they appear in Edit Mode
    desc: string;
    gallery: string[];
    stockStatus: string;
    deliveryType: string;
}

export const useProducts = (userId?: string) => {
    const [products, setProducts] = useState<ProductProps[]>([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH PRODUCTS ---
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = userId ? '/api/provider/products' : '/api/products/all';
            const options = userId
                ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) }
                : { method: 'GET', cache: 'no-store' as RequestCache };

            const res = await fetch(endpoint, options);
            if (!res.ok) throw new Error(`HTTP Status: ${res.status}`);

            const rawData = await res.json();

            let items = [];
            if (Array.isArray(rawData)) items = rawData;
            else if (Array.isArray(rawData.data)) items = rawData.data;
            else if (rawData.products && Array.isArray(rawData.products)) items = rawData.products;

            // ✅ Map Data Safely (INCLUDING ALL EDIT FIELDS)
            const formatted: ProductProps[] = items.map((item: any) => ({
                id: String(item.id),
                name: item.name || "Untitled Product",
                category: typeof item.category === 'object' ? item.category?.name : (item.category || "General"),
                price: Number(item.price) || 0,
                moq: Number(item.moq) || 1,
                unit: item.unit || 'PIECE',

                // Image Handling
                image: item?.productImage || item.image || item.img || "", // For Card
                productImage: item?.productImage || item.image || "", // For Form

                supplier: item.user?.shopName || item.user?.name || "Verified Supplier",
                isVerified: Boolean(item.isVerified),

                // ✅ Critical: Pass these through for the Edit Form
                desc: item.desc || "",
                gallery: item.gallery || [],
                stockStatus: item.stockStatus || "IN_STOCK",
                deliveryType: item.deliveryType || "DELIVERY"
            }));

            setProducts(formatted);
        } catch (e) {
            console.error("Fetch error:", e);
        } finally {
            setLoading(false);
        }
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
            const res = await fetch(`/api/products/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, userId })
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

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { products, loading, fetchProducts, saveProduct, deleteProduct };
};