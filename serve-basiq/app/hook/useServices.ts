// @/app/hook/useServices.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export function useServices(userId: string | undefined) {
    const [services, setServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // ✅ Track fetching status to prevent parallel identical calls
    const isFetching = useRef(false);
    const lastId = useRef<string | null>(null);

    const fetchServices = useCallback(async (force = false) => {
        // 1. Block if no userId
        // 2. Block if already fetching (prevents the "double call" on mount)
        // 3. Block if we already have data for this user (unless forced)
        if (!userId || isFetching.current) return;
        if (!force && lastId.current === userId) return;

        isFetching.current = true;
        setIsLoading(true);

        try {
            const res = await fetch(`/api/services?userId=${userId}`);
            const data = await res.json();
            setServices(Array.isArray(data) ? data : []);
            lastId.current = userId;
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
            isFetching.current = false;
        }
    }, [userId]);

    const deleteService = async (serviceId: string) => {
        if (!userId || !serviceId) return { success: false, error: "Missing IDs" };

        try {
            const res = await fetch('/api/services', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, serviceId })
            });

            if (res.ok) {
                // ✅ Force set lastId to null so the refetch is guaranteed to run
                lastId.current = null;
                await fetchServices(true);
                return { success: true };
            }
            return { success: false, error: "Failed to delete" };
        } catch (error) {
            return { success: false, error: "Network error" };
        }
    };

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    return {
        services,
        isLoading,
        refetch: () => fetchServices(true),
        deleteService
    };
}