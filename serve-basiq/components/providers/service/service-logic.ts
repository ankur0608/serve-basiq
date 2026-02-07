import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression'; // ✅ Import compression

// --- Types ---
export interface SubCategory {
    id: string;
    name: string;
}

export interface Category {
    id: string;
    name: string;
    children: SubCategory[];
    subcategories?: SubCategory[];
}

export interface ServiceSettingsProps {
    userId: string;
    serviceData: any;
    userData: any;
    userAddress: any;
    onComplete: () => void;
    showToast?: (msg: string, type: 'success' | 'error') => void;
}

// --- Helpers ---
export async function uploadToBackend(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    if (data.url) return data.url;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
    return urlEndpoint ? `${urlEndpoint.replace(/\/$/, "")}/${data.key}` : "";
}

// --- Custom Hook ---
export function useServiceForm({ userId, serviceData, userData, userAddress, onComplete, showToast }: ServiceSettingsProps) {
    const queryClient = useQueryClient();

    // ✅ State for Listing Type (Default to Service)
    const [listingType, setListingType] = useState<'SERVICE' | 'RENTAL'>('SERVICE');

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<string | null>(null);
    const [gettingLoc, setGettingLoc] = useState(false);

    // ✅ Detect if editing an existing Rental or Service
    useEffect(() => {
        if (serviceData) {
            if (serviceData.stock !== undefined || serviceData.rentalImg) {
                setListingType('RENTAL');
            } else {
                setListingType('SERVICE');
            }
        }
    }, [serviceData]);

    // ✅ REPLACED: Fetch Categories using TanStack Query
    // This prevents repeated calls. It caches data based on 'listingType'.
    const { data: categories = [], isLoading: loadingCats } = useQuery({
        queryKey: ['categories', listingType], // Unique key per type
        queryFn: async () => {
            const typeParam = listingType === 'RENTAL' ? 'RENTAL' : 'SERVICE';
            const res = await fetch(`/api/categories?type=${typeParam}`);
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 10, // ✅ Data remains fresh for 10 minutes (no re-fetch)
        refetchOnWindowFocus: false, // Don't refetch just because user clicked alt-tab
    });

    // ✅ HELPER: Smart Address Resolution
    const resolveAddress = (svc: any, usrAddr: any) => {
        if (svc && svc.addressLine1) {
            return {
                addressLine1: svc.addressLine1 || '',
                addressLine2: svc.addressLine2 || '',
                city: svc.city || '',
                state: svc.state || '',
                pincode: svc.pincode || '',
                latitude: Number(svc.latitude) || 0,
                longitude: Number(svc.longitude) || 0,
            };
        }
        const addresses = Array.isArray(usrAddr) ? usrAddr : (usrAddr ? [usrAddr] : []);
        const bestAddr = addresses.find((a: any) => a.type === 'Work') || addresses.find((a: any) => a.type === 'Home') || addresses[0];

        if (bestAddr) {
            return {
                addressLine1: bestAddr.line1 || bestAddr.addressLine1 || '',
                addressLine2: bestAddr.line2 || bestAddr.addressLine2 || '',
                city: bestAddr.city || '',
                state: bestAddr.state || '',
                pincode: bestAddr.pincode || '',
                latitude: Number(bestAddr.latitude) || 0,
                longitude: Number(bestAddr.longitude) || 0,
            };
        }
        return { addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', latitude: 0, longitude: 0 };
    };

    const initialAddress = resolveAddress(serviceData, userAddress);

    const [form, setForm] = useState({
        name: serviceData?.name || '',
        desc: serviceData?.desc || '',
        experience: serviceData?.experience || '',
        stock: serviceData?.stock || 1,
        categoryId: serviceData?.categoryId || '',
        subCategoryIds: serviceData?.subcategories ? serviceData.subcategories.map((s: any) => s.id) : [],
        altPhone: serviceData?.altPhone || userData?.phone || '',
        mainimg: serviceData?.mainimg || serviceData?.serviceimg || serviceData?.rentalImg || '',
        coverImg: serviceData?.coverImg || '',
        gallery: serviceData?.gallery || [],
        priceType: serviceData?.priceType || (listingType === 'RENTAL' ? 'DAILY' : 'FIXED'),
        price: serviceData?.price || '',
        ...initialAddress,
        radiusKm: serviceData?.radiusKm || 10,
        workingDays: serviceData?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        openTime: serviceData?.openTime || '09:00',
        closeTime: serviceData?.closeTime || '18:00',
        instagramUrl: serviceData?.instagramUrl || userData?.instagramUrl || '',
        facebookUrl: serviceData?.facebookUrl || userData?.facebookUrl || '',
        youtubeUrl: serviceData?.youtubeUrl || userData?.youtubeUrl || '',
        websiteUrl: serviceData?.websiteUrl || userData?.websiteUrl || '',
    });

    // Handlers
    const handleChange = (field: string, value: any) => {
        setForm(prev => {
            if (field === 'categoryId') return { ...prev, [field]: value, subCategoryIds: [] };
            return { ...prev, [field]: value };
        });
    };

    const toggleSubCategory = (subId: string) => {
        setForm(prev => {
            const currentIds = prev.subCategoryIds || [];
            const newIds = currentIds.includes(subId)
                ? currentIds.filter((id: string) => id !== subId)
                : [...currentIds, subId];
            return { ...prev, subCategoryIds: newIds };
        });
    };

    const toggleDay = (day: string) => {
        setForm(prev => {
            const days = prev.workingDays.includes(day)
                ? prev.workingDays.filter((d: string) => d !== day)
                : [...prev.workingDays, day];
            return { ...prev, workingDays: days };
        });
    };

    // ✅ UPDATED: Handle Image Upload with Compression
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setActiveUploadField(field);

            let fileToUpload = file;

            // ✅ Compression Logic
            if (file.type.startsWith('image/')) {
                const options = {
                    maxSizeMB: 1,           // Max 1MB
                    maxWidthOrHeight: 1920,  // Max 1920px width/height
                    useWebWorker: true,
                    initialQuality: 0.8
                };
                try {
                    fileToUpload = await imageCompression(file, options);
                } catch (cErr) {
                    console.error("Compression skipped due to error:", cErr);
                }
            }

            const url = await uploadToBackend(fileToUpload);

            if (field === 'gallery') handleChange('gallery', [...form.gallery, url]);
            else handleChange(field, url);

            showToast?.("Image uploaded successfully!", "success");
        } catch (err: any) {
            console.error(err);
            showToast?.("Upload failed", "error");
        } finally {
            setUploading(false);
            setActiveUploadField(null);
        }
    };

    const removeGalleryImg = (index: number) => {
        const newGallery = [...form.gallery];
        newGallery.splice(index, 1);
        handleChange('gallery', newGallery);
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) return showToast?.("Geolocation not supported", "error");
        setGettingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                setGettingLoc(false);
                showToast?.("GPS Captured!", "success");
            },
            (err) => {
                setGettingLoc(false);
                showToast?.("GPS Error", "error");
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...form,
                price: Number(form.price),
                experience: Number(form.experience) || 0,
                stock: Number(form.stock) || 1,
                radiusKm: Number(form.radiusKm),
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                [listingType === 'RENTAL' ? 'rentalImg' : 'serviceimg']: form.mainimg,
                subCategoryIds: Array.isArray(form.subCategoryIds) ? form.subCategoryIds : [],
            };

            const endpoint = listingType === 'RENTAL' ? '/api/rentals' : '/api/services';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    id: serviceData?.id,
                    ...payload
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Failed to save");

            // ✅ Invalidate queries so the main list updates immediately
            queryClient.invalidateQueries({ queryKey: ['services', userId] });

            showToast?.(`${listingType === 'RENTAL' ? 'Rental' : 'Service'} Saved!`, "success");
            onComplete();
        } catch (error: any) {
            console.error("❌ [handleSubmit] Error:", error);
            showToast?.(error.message || "Failed to save", "error");
        } finally {
            setLoading(false);
        }
    };

    const activeSubCategories = useMemo(() => {
        // Categories now comes from React Query, defaults to empty array
        const selectedCat = categories.find((c: Category) => c.id === form.categoryId);
        if (!selectedCat) return [];
        return selectedCat.children || selectedCat.subcategories || [];
    }, [categories, form.categoryId]);

    return {
        step, setStep, loading, uploading, activeUploadField, gettingLoc,
        categories, loadingCats, form, listingType, setListingType,
        handleChange, toggleSubCategory, toggleDay, handleImageUpload,
        removeGalleryImg, handleGetLocation, handleSubmit, activeSubCategories
    };
}