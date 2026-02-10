'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';

export interface SubCategory {
    id: string;
    name: string;
}

export interface Category {
    id: string;
    name: string;
    children?: SubCategory[];
    subcategories?: SubCategory[];
}

export interface ServiceSettingsProps {
    userId: string;
    serviceData: any;
    userData: any;
    userAddress: any;
    onComplete: () => void;
    showToast?: (msg: string, type: 'success' | 'error') => void;
    preSelectedType?: 'SERVICE' | 'RENTAL';
}

const normalizeSubIds = (data: any): string[] => {
    const subs = data?.subcategory || data?.subcategories || [];
    if (Array.isArray(subs)) return subs.map((s: any) => s.id);
    return subs?.id ? [subs.id] : [];
};

export async function uploadToBackend(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
}

export function useServiceForm({
    userId,
    serviceData,
    userData,
    userAddress,
    onComplete,
    showToast,
    preSelectedType
}: ServiceSettingsProps) {
    const queryClient = useQueryClient();

    // Initialize listing type
    const [listingType, setListingType] = useState<'SERVICE' | 'RENTAL'>(() => {
        if (preSelectedType) return preSelectedType;
        if (!serviceData) return 'SERVICE';
        return serviceData.listingType === 'RENTAL' ||
            serviceData.stock !== undefined ||
            serviceData.rentalImg
            ? 'RENTAL'
            : 'SERVICE';
    });

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<string | null>(null);
    const [gettingLoc, setGettingLoc] = useState(false);

    // Optimized Caching Logic
    const { data: categories = [], isLoading: loadingCats } = useQuery({
        queryKey: ['categories', listingType],
        queryFn: async () => {
            const res = await fetch(`/api/categories?type=${listingType}`);
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        },
        // ⚡ CACHING SETTINGS:
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    // Initialize State
    const [form, setForm] = useState(() => ({
        name: serviceData?.name || '',
        desc: serviceData?.desc || '',
        experience: serviceData?.experience || '',
        stock: serviceData?.stock || 1,

        categoryId: serviceData?.categoryId || '',
        subCategoryIds: normalizeSubIds(serviceData),

        // ✅ Automatically set phone from user profile
        altPhone: serviceData?.altPhone || userData?.phone || '',

        mainimg:
            serviceData?.serviceimg ||
            serviceData?.rentalImg ||
            serviceData?.mainimg ||
            '',
        coverImg: serviceData?.coverImg || '',
        gallery: serviceData?.gallery || [],

        priceType:
            serviceData?.priceType ||
            (listingType === 'RENTAL' ? 'DAILY' : 'FIXED'),
        price: serviceData?.price || '',

        // Rental Fields
        itemCondition: serviceData?.itemCondition || 'New',
        securityDeposit: serviceData?.securityDeposit || '',
        minDuration: serviceData?.minDuration || '1 Hour',
        // maxDuration removed from state
        rentalMode: serviceData?.rentalMode || 'PICKUP',

        addressLine1: serviceData?.addressLine1 || userAddress?.line1 || '',
        city: serviceData?.city || userAddress?.city || '',
        state: serviceData?.state || userAddress?.state || '',
        pincode: serviceData?.pincode || userAddress?.pincode || '',

        latitude: Number(serviceData?.latitude) || 0,
        longitude: Number(serviceData?.longitude) || 0,
        radiusKm: serviceData?.radiusKm || 10,

        workingDays:
            serviceData?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        openTime: serviceData?.openTime || '09:00',
        closeTime: serviceData?.closeTime || '18:00',
    }));

    const activeSubCategories = useMemo(() => {
        const selectedCat = categories.find(
            (c: Category) => c.id === form.categoryId
        );

        if (selectedCat) {
            return selectedCat.children || selectedCat.subcategories || [];
        }

        const existing = serviceData?.subcategory || serviceData?.subcategories;
        if (!existing) return [];

        return Array.isArray(existing) ? existing : [existing];
    }, [categories, form.categoryId, serviceData]);

    const handleChange = (field: string, value: any) => {
        setForm(prev =>
            field === 'categoryId'
                ? { ...prev, categoryId: value, subCategoryIds: [] }
                : { ...prev, [field]: value }
        );
    };

    const toggleSubCategory = (subId: string) => {
        setForm(prev => ({
            ...prev,
            subCategoryIds: prev.subCategoryIds.includes(subId)
                ? prev.subCategoryIds.filter(id => id !== subId)
                : [...prev.subCategoryIds, subId],
        }));
    };

    const toggleDay = (day: string) => {
        setForm(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter((d: string) => d !== day)
                : [...prev.workingDays, day],
        }));
    };

    const removeGalleryImg = (index: number) => {
        setForm(prev => {
            const newGallery = [...prev.gallery];
            newGallery.splice(index, 1);
            return { ...prev, gallery: newGallery };
        });
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: string
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setActiveUploadField(field);

            let uploadFile = file;
            if (file.type.startsWith('image/')) {
                uploadFile = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                });
            }

            const url = await uploadToBackend(uploadFile);

            if (field === 'gallery')
                handleChange('gallery', [...form.gallery, url]);
            else handleChange(field, url);

            showToast?.('Image uploaded', 'success');
        } catch {
            showToast?.('Upload failed', 'error');
        } finally {
            setUploading(false);
            setActiveUploadField(null);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) return;

        setGettingLoc(true);
        navigator.geolocation.getCurrentPosition(
            pos => {
                setForm(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                }));
                setGettingLoc(false);
            },
            () => setGettingLoc(false)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...form,
                price: Number(form.price),
                experience: Number(form.experience),
                stock: Number(form.stock),
                radiusKm: Number(form.radiusKm),
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                subCategoryIds: form.subCategoryIds,
                [listingType === 'RENTAL' ? 'rentalImg' : 'serviceimg']: form.mainimg,

                // Rental fields (maxDuration removed)
                itemCondition: form.itemCondition,
                securityDeposit: Number(form.securityDeposit),
                minDuration: form.minDuration,
                rentalMode: form.rentalMode
            };

            const endpoint =
                listingType === 'RENTAL' ? '/api/rentals' : '/api/services';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    id: serviceData?.id,
                    ...payload,
                }),
            });

            const data = await res.json();
            if (!data.success) throw new Error();

            queryClient.invalidateQueries({ queryKey: ['services', userId] });
            showToast?.('Saved successfully', 'success');
            onComplete();
        } catch {
            showToast?.('Save failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        setStep,
        loading,
        uploading,
        activeUploadField,
        gettingLoc,
        categories,
        loadingCats,
        activeSubCategories,
        form,
        listingType,
        setListingType,
        handleChange,
        toggleSubCategory,
        toggleDay,
        handleImageUpload,
        removeGalleryImg,
        handleGetLocation,
        handleSubmit,
    };
}