// service-logic.ts
import { useState, useEffect, useMemo } from 'react';

// --- Types ---
export interface SubCategory {
    id: string;
    name: string;
}

export interface Category {
    id: string;
    name: string;
    children: SubCategory[];
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
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<string | null>(null);
    const [gettingLoc, setGettingLoc] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    // Initial Form State
    const [form, setForm] = useState({
        name: serviceData?.name || '',
        desc: serviceData?.desc || '',
        experience: serviceData?.experience || '',
        categoryId: serviceData?.categoryId || '',
        subCategoryIds: serviceData?.subcategories ? serviceData.subcategories.map((s: any) => s.id) : [],
        altPhone: serviceData?.altPhone || userData?.phone || '',
        mainimg: serviceData?.mainimg || serviceData?.serviceimg || '',
        coverImg: serviceData?.coverImg || '',
        gallery: serviceData?.gallery || [],
        priceType: serviceData?.priceType || 'FIXED',
        price: serviceData?.price || '',

        // Address
        addressLine1: serviceData?.addressLine1 || userAddress?.addressLine1 || '',
        addressLine2: serviceData?.addressLine2 || userAddress?.addressLine2 || '',
        city: serviceData?.city || userAddress?.city || '',
        state: serviceData?.state || userAddress?.state || '',
        pincode: serviceData?.pincode || userAddress?.pincode || '',

        latitude: serviceData?.latitude ? Number(serviceData.latitude) : 0,
        longitude: serviceData?.longitude ? Number(serviceData.longitude) : 0,
        radiusKm: serviceData?.radiusKm || 10,
        workingDays: serviceData?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        openTime: serviceData?.openTime || '09:00',
        closeTime: serviceData?.closeTime || '18:00',
    });

    // Sync Address when Data Arrives
    useEffect(() => {
        if (!serviceData && userAddress) {
            setForm(prev => ({
                ...prev,
                addressLine1: prev.addressLine1 || userAddress.addressLine1 || '',
                addressLine2: prev.addressLine2 || userAddress.addressLine2 || '',
                city: prev.city || userAddress.city || '',
                state: prev.state || userAddress.state || '',
                pincode: prev.pincode || userAddress.pincode || '',
            }));
        }
    }, [userAddress, serviceData]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories?type=SERVICE');
                const data = await res.json();
                if (Array.isArray(data)) setCategories(data);
            } catch (e) {
                showToast?.("Failed to load categories", "error");
            } finally {
                setLoadingCats(false);
            }
        };
        fetchCategories();
    }, [showToast]);

    // Handlers
    const handleChange = (field: string, value: any) => {
        setForm(prev => {
            // If category changes, clear selected subcategories
            if (field === 'categoryId') return { ...prev, [field]: value, subCategoryIds: [] };
            return { ...prev, [field]: value };
        });
    };

    const toggleSubCategory = (subId: string) => {
        setForm(prev => {
            const currentIds = prev.subCategoryIds || [];
            const newIds = currentIds.includes(subId)
                ? currentIds.filter((id: string) => id !== subId) // Remove
                : [...currentIds, subId]; // Add
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setUploading(true);
            setActiveUploadField(field);
            const url = await uploadToBackend(file);
            if (field === 'gallery') handleChange('gallery', [...form.gallery, url]);
            else handleChange(field, url);
            showToast?.("Image uploaded!", "success");
        } catch (err: any) {
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
                if (err.code === 1) showToast?.("GPS Permission Denied", "error");
                else showToast?.("GPS Error", "error");
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
                experience: Number(form.experience),
                radiusKm: Number(form.radiusKm),
                serviceimg: form.mainimg,
            };

            const res = await fetch('/api/services/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, serviceId: serviceData?.id, ...payload })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Failed to save");
            showToast?.("Service Saved Successfully!", "success");
            onComplete();
        } catch (error: any) {
            showToast?.(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // 🟢 SAFETY CHECK: Handles both 'children' and 'subcategories' key from API
    const activeSubCategories = useMemo(() => {
        const selectedCat = categories.find(c => c.id === form.categoryId);
        if (!selectedCat) return [];
        return selectedCat.children || (selectedCat as any).subcategories || [];
    }, [categories, form.categoryId]);

    return {
        step, setStep, loading, uploading, activeUploadField, gettingLoc,
        categories, loadingCats, form,
        handleChange, toggleSubCategory, toggleDay, handleImageUpload,
        removeGalleryImg, handleGetLocation, handleSubmit, activeSubCategories
    };
}