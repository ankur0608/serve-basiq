import { useState, useCallback } from 'react';

export const useProducts = (userId: string) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // --- FETCH PRODUCTS ---
    const fetchProducts = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/provider/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();
            if (data.success) setProducts(data.products);
        } catch (e) {
            console.error("Fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // --- SAVE (CREATE / UPDATE) ---
    const saveProduct = async (productData: any, isEditing: boolean) => {
        setLoading(true);
        try {
            const endpoint = isEditing
                ? `/api/products/${productData.id}`
                : '/api/products/create';

            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...productData })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Failed to save");

            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // --- DELETE ---
    const deleteProduct = async (productId: string) => {
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

    return {
        products,
        loading,
        fetchProducts,
        saveProduct,
        deleteProduct
    };
};