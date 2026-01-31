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
    // 🔍 LOG: Initial Props
    useEffect(() => {
        console.log("🚀 [useServiceForm] Hook Initialized with:", { userId, hasServiceData: !!serviceData, userAddress });
    }, []);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<string | null>(null);
    const [gettingLoc, setGettingLoc] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    // ✅ HELPER: Smart Address Resolution
    const resolveAddress = (svc: any, usrAddr: any) => {
        console.log("🔍 [resolveAddress] Input:", { svc, usrAddr });

        // 1. Priority: Existing Service Data
        if (svc && svc.addressLine1) {
            console.log("✅ [resolveAddress] Using Existing Service Address");
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

        // 2. Fallback: User Profile Address
        const addresses = Array.isArray(usrAddr) ? usrAddr : (usrAddr ? [usrAddr] : []);

        const bestAddr = addresses.find((a: any) => a.type === 'Work')
            || addresses.find((a: any) => a.type === 'Home')
            || addresses[0];

        if (bestAddr) {
            console.log("✅ [resolveAddress] Found User Address:", bestAddr);
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

        console.warn("⚠️ [resolveAddress] No address found. Starting empty.");
        // Return default object structure
        return { addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', latitude: 0, longitude: 0 };
    };

    // ✅ INITIAL FORM STATE
    const initialAddress = resolveAddress(serviceData, userAddress);

    const [form, setForm] = useState({
        name: serviceData?.name || '',
        desc: serviceData?.desc || '',
        experience: serviceData?.experience || '',
        categoryId: serviceData?.categoryId || '',
        subCategoryIds: serviceData?.subcategories ? serviceData.subcategories.map((s: any) => s.id) : [],

        // Contact
        altPhone: serviceData?.altPhone || userData?.phone || '',

        // Visuals
        mainimg: serviceData?.mainimg || serviceData?.serviceimg || '',
        coverImg: serviceData?.coverImg || '',
        gallery: serviceData?.gallery || [],

        // Pricing
        priceType: serviceData?.priceType || 'FIXED',
        price: serviceData?.price || '',

        // ✅ Address (Spread the resolved object)
        ...initialAddress,
        radiusKm: serviceData?.radiusKm || 10,

        // Schedule
        workingDays: serviceData?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        openTime: serviceData?.openTime || '09:00',
        closeTime: serviceData?.closeTime || '18:00',

        // ✅ Socials
        instagramUrl: serviceData?.instagramUrl || userData?.instagramUrl || '',
        facebookUrl: serviceData?.facebookUrl || userData?.facebookUrl || '',
        youtubeUrl: serviceData?.youtubeUrl || userData?.youtubeUrl || '',
        websiteUrl: serviceData?.websiteUrl || userData?.websiteUrl || '',
    });

    // ✅ FETCH FRESH USER DATA ON MOUNT
    useEffect(() => {
        if (!serviceData && userId) {
            console.log("🔄 [useEffect] Fetching fresh user profile...");
            const fetchLatestProfile = async () => {
                try {
                    const res = await fetch(`/api/user/profile?userId=${userId}`);
                    if (res.ok) {
                        const latestUser = await res.json();
                        console.log("📥 [useEffect] Fresh User Data Received:", latestUser);

                        setForm(prev => {
                            // ✅ FIX: Provide a default object structure so TypeScript knows these properties exist
                            const freshAddress = latestUser.addresses && latestUser.addresses.length > 0
                                ? resolveAddress(null, latestUser.addresses)
                                : { addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', latitude: 0, longitude: 0 };

                            return {
                                ...prev,
                                // Sync Socials if empty
                                instagramUrl: prev.instagramUrl || latestUser.instagramUrl || '',
                                facebookUrl: prev.facebookUrl || latestUser.facebookUrl || '',
                                youtubeUrl: prev.youtubeUrl || latestUser.youtubeUrl || '',
                                websiteUrl: prev.websiteUrl || latestUser.websiteUrl || '',
                                altPhone: prev.altPhone || latestUser.phone || '',

                                // Sync Address if empty in form but exists in profile
                                addressLine1: prev.addressLine1 || freshAddress.addressLine1 || '',
                                addressLine2: prev.addressLine2 || freshAddress.addressLine2 || '',
                                city: prev.city || freshAddress.city || '',
                                state: prev.state || freshAddress.state || '',
                                pincode: prev.pincode || freshAddress.pincode || '',
                            };
                        });
                    }
                } catch (e) {
                    console.error("❌ [useEffect] Failed to fetch profile:", e);
                }
            };
            fetchLatestProfile();
        }
    }, [userId, serviceData]);

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

        console.log("📤 [handleSubmit] Generating Payload...");

        try {
            const payload = {
                ...form,
                price: Number(form.price),
                experience: Number(form.experience),
                radiusKm: Number(form.radiusKm),
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                serviceimg: form.mainimg,
                mainimg: form.mainimg,
                subCategoryIds: Array.isArray(form.subCategoryIds) ? form.subCategoryIds : [],

                // Address fields being sent
                addressLine1: form.addressLine1,
                addressLine2: form.addressLine2,
                city: form.city,
                state: form.state,
                pincode: form.pincode,

                // Socials
                instagramUrl: form.instagramUrl,
                facebookUrl: form.facebookUrl,
                youtubeUrl: form.youtubeUrl,
                websiteUrl: form.websiteUrl,
            };

            console.log("📦 [handleSubmit] Final Payload:", payload);

            const res = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    serviceId: serviceData?.id,
                    ...payload
                })
            });

            const data = await res.json();
            console.log("📥 [handleSubmit] Response:", data);

            if (!data.success) throw new Error(data.message || "Failed to save");

            showToast?.(serviceData ? "Service Updated!" : "Service Created!", "success");
            onComplete();
        } catch (error: any) {
            console.error("❌ [handleSubmit] Error:", error);
            showToast?.(error.message || "Failed to save service", "error");
        } finally {
            setLoading(false);
        }
    };

    const activeSubCategories = useMemo(() => {
        const selectedCat = categories.find(c => c.id === form.categoryId);
        if (!selectedCat) return [];
        return selectedCat.children || selectedCat.subcategories || [];
    }, [categories, form.categoryId]);

    return {
        step, setStep, loading, uploading, activeUploadField, gettingLoc,
        categories, loadingCats, form,
        handleChange, toggleSubCategory, toggleDay, handleImageUpload,
        removeGalleryImg, handleGetLocation, handleSubmit, activeSubCategories
    };
}