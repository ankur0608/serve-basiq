import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import imageCompression from 'browser-image-compression';
import { onboardSchema } from "@/lib/validators";
import { useUIStore, User } from "@/lib/store";

// --- CONFIGURATION ---
const MAX_FRONTEND_SIZE_MB = 10; // Initial check before compression
const COMPRESSION_OPTIONS = {
    maxSizeMB: 0.8,          // Target ~800KB
    maxWidthOrHeight: 1200,  // Resize 4K images down to 1200px
    useWebWorker: true,      // Run in background thread
    fileType: "image/webp"   // Convert to WebP for better compression
};

// --- UTILITY: Upload & Compress ---
async function uploadToBackend(file: File): Promise<string> {
    // 1. Basic Frontend Validation
    if (file.size > MAX_FRONTEND_SIZE_MB * 1024 * 1024) {
        throw new Error(`File is too large. Please select an image under ${MAX_FRONTEND_SIZE_MB}MB.`);
    }
    if (!file.type.startsWith("image/")) {
        throw new Error("Invalid file type. Please upload an image.");
    }

    try {
        // 2. Compress Image
        console.log(`📉 Compressing ${file.name} (${(file.size / 1024).toFixed(2)}KB)...`);
        const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
        console.log(`✅ Compressed to ${(compressedFile.size / 1024).toFixed(2)}KB`);

        // 3. Prepare Upload
        const formData = new FormData();
        formData.append("file", compressedFile, file.name);

        // 4. Send to Backend
        const res = await fetch("/api/upload", { 
            method: "POST", 
            body: formData 
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || data.error || "Upload failed");
        }

        // 5. Resolve URL
        if (data.url) return data.url;
        if (data.key && process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
            return `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "")}/${data.key}`;
        }

        throw new Error("Upload successful but server returned no URL.");

    } catch (error: any) {
        console.error("Upload Error:", error);
        throw new Error(error.message || "Failed to process image.");
    }
}

// --- HOOK ---
export function useProviderOnboarding() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { currentUser, setCurrentUser } = useUIStore();

    const [uploading, setUploading] = useState(false);
    const [gettingLoc, setGettingLoc] = useState(false);
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        altPhone: "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        latitude: 0,
        longitude: 0,
        providerType: "BOTH",
    });

    // --- FETCH PROFILE ---
    const { isLoading: isFetchingProfile } = useQuery({
        queryKey: ["userProfile", currentUser?.id],
        queryFn: async () => {
            if (!currentUser?.id) return null;
            const res = await fetch(`/api/user/profile?identifier=${currentUser.id}`);
            if (!res.ok) throw new Error("Failed to fetch profile");
            const data = await res.json();

            const addr = data.addresses?.find((a: any) => a.type === 'Home') || data.addresses?.[0];

            setForm((prev) => ({
                ...prev,
                fullName: data.name || prev.fullName,
                email: data.email || prev.email,
                altPhone: data.phone || prev.altPhone,
                providerType: data.providerType || prev.providerType,
                addressLine1: addr?.line1 || prev.addressLine1,
                addressLine2: addr?.line2 || prev.addressLine2,
                landmark: addr?.landmark || prev.landmark,
                city: addr?.city || prev.city,
                state: addr?.state || prev.state,
                pincode: addr?.pincode || prev.pincode,
            }));

            if (data.profileImage || data.img) {
                setImgPreview(data.profileImage || data.img);
            }
            return data;
        },
        enabled: !!currentUser?.id,
        staleTime: 300000, // 5 mins
    });

    // --- SUBMIT MUTATION ---
    const onboardingMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch("/api/provider/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUser?.id, ...payload }),
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: () => {
            if (currentUser) {
                const updatedUser: User = {
                    ...currentUser,
                    isWorker: true,
                    isWebsite: false,
                    providerType: form.providerType,
                };
                setCurrentUser(updatedUser);
            }
            queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] });
            router.push("/provider/dashboard?new=true");
        },
        onError: (error: any) => {
            if (error.details) {
                const formattedErrors: Record<string, string> = {};
                error.details.forEach((issue: any) => {
                    formattedErrors[issue.path[0]] = issue.message;
                });
                setErrors(formattedErrors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                alert(error.message || "Registration failed. Please try again.");
            }
        },
    });

    // --- HANDLERS ---
    const handleChange = useCallback((field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    const handleGetLocation = useCallback(() => {
        if (!navigator.geolocation) return alert("Geolocation not supported");
        setGettingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm((prev) => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                }));
                setGettingLoc(false);
            },
            () => {
                alert("Location access denied.");
                setGettingLoc(false);
            },
            { enableHighAccuracy: true }
        );
    }, []);

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await uploadToBackend(file);
            setImgPreview(url);
            // Clear error if exists
            if (errors.profileImage) {
                 setErrors(prev => {
                     const n = {...prev};
                     delete n.profileImage;
                     return n;
                 });
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUploading(false);
        }
    }, [errors]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return router.push("/login");

        try {
            const payload = {
                ...form,
                profileImage: imgPreview || "",
                phone: form.altPhone,
            };
            
            // Validate against schema before network request
            onboardSchema.parse(payload);
            onboardingMutation.mutate(payload);
        } catch (error: any) {
            if (error.issues) {
                const formattedErrors: Record<string, string> = {};
                error.issues.forEach((issue: any) => {
                    formattedErrors[issue.path[0]] = issue.message;
                });
                setErrors(formattedErrors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    };

    return {
        form,
        loading: onboardingMutation.isPending || isFetchingProfile,
        uploading,
        gettingLoc,
        imgPreview,
        errors,
        handleChange,
        handleGetLocation,
        handleImageUpload,
        handleSubmit,
    };
}