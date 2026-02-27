// hooks/useRequestsLogic.ts
import { useState, useMemo, useEffect } from 'react';
import { Filter, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { useProviderRequests } from '@/app/hook/useProviderRequests';

export type TabType = 'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ViewMode = 'SERVICES' | 'PRODUCTS';

export const STATUS_TABS: { id: TabType; label: string; icon: any }[] = [
    { id: 'ALL', label: 'All', icon: Filter },
    { id: 'PENDING', label: 'Pending', icon: Clock },
    { id: 'ACTIVE', label: 'Active', icon: Truck },
    { id: 'COMPLETED', label: 'Done', icon: CheckCircle2 },
    { id: 'CANCELLED', label: 'Rejected', icon: XCircle },
];

export function useRequestsLogic(providerType: string, currentUserId: string | undefined, showToast: any) {
    const [viewMode, setViewMode] = useState<ViewMode>(providerType === 'PRODUCT' ? 'PRODUCTS' : 'SERVICES');
    const [activeTab, setActiveTab] = useState<TabType>('PENDING');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const { data, isLoading, refetch } = useProviderRequests(currentUserId, providerType);
    const bookings = data?.bookings || [];
    const orders = data?.orders || [];

    // Sync provider type changes
    useEffect(() => {
        if (providerType === 'PRODUCT') setViewMode('PRODUCTS');
        else if (providerType === 'SERVICE') setViewMode('SERVICES');
    }, [providerType]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isFilterModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isFilterModalOpen]);

    // Format data into a unified structure
    const currentData = useMemo(() => {
        if (viewMode === 'SERVICES') {
            return bookings.map((b: any) => {
                const isRental = !!b.rental;
                return {
                    ...b,
                    type: isRental ? 'RENTAL' : 'BOOKING',
                    date: b.createdAt || b.bookingDate,
                    displayStatus: b.status,
                    title: isRental ? b.rental?.name : (b.service?.name || "Unknown Service"),
                    price: isRental ? b.totalPrice : (b.service?.price || 0),
                    img: b.user?.profileImage || b.user?.image || "",
                    timeSlot: isRental
                        ? `${b.totalDays || 1} Day(s) • ${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}`
                        : (b.openTime ? `${b.openTime} - ${b.closeTime}` : "Scheduled"),
                    paymentStatus: 'PENDING'
                };
            });
        } else {
            return orders.map((o: any) => ({
                ...o,
                type: 'ORDER',
                date: o.createdAt,
                displayStatus: o.status,
                title: o.product ? `${o.product.name} (x${o.quantity})` : "Unknown Product",
                price: o.totalPrice || 0,
                img: o.user?.profileImage || o.user?.image || "",
                deliveryType: o.product?.deliveryType || 'DELIVERY',
                paymentStatus: o.paymentStatus
            }));
        }
    }, [viewMode, bookings, orders]);

    // Apply filters and search
    const filteredRequests = useMemo(() => {
        const sorted = [...currentData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return sorted.filter((i: any) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                i.title?.toLowerCase().includes(searchLower) ||
                i.id?.toLowerCase().includes(searchLower) ||
                i.user?.name?.toLowerCase().includes(searchLower);

            const s = i.displayStatus;
            let matchesTab = false;
            if (activeTab === 'ALL') matchesTab = true;
            else if (activeTab === 'PENDING') matchesTab = ['PENDING', 'REQUESTED'].includes(s);
            else if (activeTab === 'CANCELLED') matchesTab = ['CANCELLED', 'REJECTED', 'RETURNED'].includes(s);
            else if (activeTab === 'COMPLETED') matchesTab = ['COMPLETED', 'DELIVERED', 'RETURNED'].includes(s);
            else if (activeTab === 'ACTIVE') matchesTab = ['ACCEPTED', 'APPROVED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'IN_PROGRESS', 'ACTIVE', 'OVERDUE'].includes(s);

            return matchesSearch && matchesTab;
        });
    }, [currentData, activeTab, searchTerm]);

    const handleUpdateStatus = async (id: string, newStatus: string, isRental: boolean) => {
        setProcessingId(id);
        let endpoint = '';
        let bodyKey = 'bookingId';

        if (viewMode === 'SERVICES') {
            if (isRental) {
                endpoint = '/api/rentals/update-status';
                bodyKey = 'bookingId';
            } else {
                endpoint = '/api/bookings/update-status';
                bodyKey = 'bookingId';
            }
        } else {
            endpoint = '/api/orders/update-status';
            bodyKey = 'orderId';
        }

        try {
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [bodyKey]: id, status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Status updated to ${newStatus}`, "success");
                refetch();
            } else {
                showToast(data.message || "Update failed", "error");
            }
        } catch (error) {
            showToast("Network error occurred", "error");
        } finally {
            setProcessingId(null);
        }
    };

    return {
        viewMode, setViewMode,
        activeTab, setActiveTab,
        searchTerm, setSearchTerm,
        isFilterModalOpen, setIsFilterModalOpen,
        processingId,
        isLoading,
        currentData,
        filteredRequests,
        handleUpdateStatus
    };
}