'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';
import { uploadToBackend } from '@/lib/uploadToBackend';

export interface SubCategory { id: string; name: string; }
export interface Category { id: string; name: string; children?: SubCategory[]; subcategories?: SubCategory[]; }

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

export function useServiceForm({ userId, serviceData, userData, userAddress, onComplete, showToast, preSelectedType }: ServiceSettingsProps) {
    const queryClient = useQueryClient();

    const [listingType, setListingType] = useState<'SERVICE' | 'RENTAL'>(() => {
        if (preSelectedType) return preSelectedType;
        if (!serviceData) return 'SERVICE';
        return serviceData.listingType === 'RENTAL' || serviceData.stock !== undefined || serviceData.rentalImg ? 'RENTAL' : 'SERVICE';
    });

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<string | null>(null);
    const [gettingLoc, setGettingLoc] = useState(false);

    const { data: categories = [], isLoading: loadingCats } = useQuery({
        queryKey: ['categories', listingType],
        queryFn: async () => {
            const res = await fetch(`/api/categories?type=${listingType}`);
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        },
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    const [form, setForm] = useState(() => ({
        name: serviceData?.name || '',
        desc: serviceData?.desc || '',
        experience: serviceData?.experience || '',
        stock: serviceData?.stock || 1,
        categoryId: serviceData?.categoryId || '',
        customCategoryName: serviceData?.customCategory || '', // ✅ Added state for the custom text
        subCategoryIds: normalizeSubIds(serviceData),
        altPhone: serviceData?.altPhone || userData?.phone || '',

        isRemote: serviceData?.isRemote || false,

        mainimg: serviceData?.serviceimg || serviceData?.rentalImg || serviceData?.mainimg || '',
        serviceImages: serviceData?.serviceImages || serviceData?.rentalImages || [],
        coverImg: serviceData?.coverImg || '',
        gallery: serviceData?.gallery || [],

        priceType: serviceData?.priceType || (listingType === 'RENTAL' ? 'DAILY' : 'FIXED'),
        price: serviceData?.price || '',

        itemCondition: serviceData?.itemCondition || 'New',
        securityDeposit: serviceData?.securityDeposit || '',
        minDuration: serviceData?.minDuration || '1 Hour',
        rentalMode: serviceData?.rentalMode || 'PICKUP',

        addressLine1: serviceData?.addressLine1 || userAddress?.line1 || '',
        city: serviceData?.city || userAddress?.city || '',
        state: serviceData?.state || userAddress?.state || '',
        pincode: serviceData?.pincode || userAddress?.pincode || '',
        latitude: Number(serviceData?.latitude) || 0,
        longitude: Number(serviceData?.longitude) || 0,
        radiusKm: serviceData?.radiusKm || 10,

        workingDays: serviceData?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        openTime: serviceData?.openTime || '09:00',
        closeTime: serviceData?.closeTime || '18:00',
        is24x7: serviceData?.is24x7 || false,
    }));

    const activeSubCategories = useMemo(() => {
        const selectedCat = categories.find((c: Category) => c.id === form.categoryId);
        if (selectedCat) return selectedCat.children || selectedCat.subcategories || [];
        const existing = serviceData?.subcategory || serviceData?.subcategories;
        if (!existing) return [];
        return Array.isArray(existing) ? existing : [existing];
    }, [categories, form.categoryId, serviceData]);

    const handleChange = (field: string, value: any) => {
        setForm(prev => field === 'categoryId' ? { ...prev, categoryId: value, subCategoryIds: [] } : { ...prev, [field]: value });
    };

    const toggleSubCategory = (subId: string) => {
        setForm(prev => ({ ...prev, subCategoryIds: prev.subCategoryIds.includes(subId) ? prev.subCategoryIds.filter(id => id !== subId) : [...prev.subCategoryIds, subId], }));
    };

    const toggleDay = (day: string) => {
        setForm(prev => ({ ...prev, workingDays: prev.workingDays.includes(day) ? prev.workingDays.filter((d: string) => d !== day) : [...prev.workingDays, day], }));
    };

    const removeGalleryImg = (index: number) => {
        setForm(prev => { const newGallery = [...prev.gallery]; newGallery.splice(index, 1); return { ...prev, gallery: newGallery }; });
    };
    const removeServiceImage = (index: number) => {
        setForm(prev => { const newArr = [...prev.serviceImages]; newArr.splice(index, 1); return { ...prev, serviceImages: newArr }; });
    };

    const processFile = async (file: File) => {
        let uploadFile = file;
        if (file.type.startsWith('image/')) {
            try {
                const compressedBlob = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/webp" });
                const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                uploadFile = new File([compressedBlob], newFileName, { type: "image/webp" });
            } catch (err) {
                console.error("Image compress failed", err);
            }
        }
        return await uploadToBackend(uploadFile);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setActiveUploadField(field);

        try {
            const url = await processFile(files[0]);
            handleChange(field, url);
            showToast?.('Uploaded successfully', 'success');
        } catch (error: any) {
            showToast?.(error.message || 'Upload failed', 'error');
        } finally {
            setUploading(false);
            setActiveUploadField(null);
            e.target.value = '';
        }
    };

    const uploadMultipleFiles = async (files: File[], field: 'gallery' | 'serviceImages') => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setActiveUploadField(field);

        try {
            const uploadPromises = files.map(file => processFile(file));
            const newUrls = await Promise.all(uploadPromises);

            setForm(prev => ({ ...prev, [field]: [...prev[field], ...newUrls] }));
            showToast?.(`${newUrls.length} items uploaded`, 'success');
        } catch (error: any) {
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
            pos => { setForm(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude, })); setGettingLoc(false); },
            () => setGettingLoc(false)
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...form,
                price: form.priceType === 'QUOTE' ? 0 : Number(form.price),
                experience: Number(form.experience),
                stock: Number(form.stock),
                radiusKm: Number(form.radiusKm),
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),

                // ✅ Send empty subCategory array if "OTHER" is picked
                subCategoryIds: form.categoryId === 'OTHER' ? [] : form.subCategoryIds,
                // ✅ Extract Custom Category Name into payload
                customCategoryName: form.categoryId === 'OTHER' ? form.customCategoryName : undefined,

                isRemote: form.isRemote,

                [listingType === 'RENTAL' ? 'rentalImg' : 'serviceimg']: form.mainimg,
                [listingType === 'RENTAL' ? 'rentalImages' : 'serviceImages']: form.serviceImages,
                itemCondition: form.itemCondition,
                securityDeposit: Number(form.securityDeposit),
                minDuration: form.minDuration,
                rentalMode: form.rentalMode,
                workingDays: form.is24x7 ? [] : form.workingDays,
                openTime: form.is24x7 ? null : form.openTime,
                closeTime: form.is24x7 ? null : form.closeTime,
            };

            const endpoint = listingType === 'RENTAL' ? '/api/rentals' : '/api/services';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, id: serviceData?.id, ...payload }),
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
        step, setStep, loading, uploading, activeUploadField, gettingLoc,
        categories, loadingCats, activeSubCategories,
        form, listingType, setListingType,
        handleChange, toggleSubCategory, toggleDay,
        handleImageUpload, uploadMultipleFiles, removeGalleryImg, removeServiceImage, handleGetLocation, handleSubmit,
    };
}