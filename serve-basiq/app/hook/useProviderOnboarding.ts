import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onboardSchema } from "@/lib/validators";
import { useUIStore, User } from "@/lib/store"; // Added User import
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --- HELPER: Upload to Backend ---
async function uploadToBackend(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Upload failed");
    }

    const data = await res.json();
    if (data.url) return data.url;
    if (data.key) {
        const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
        if (urlEndpoint) return `${urlEndpoint.replace(/\/$/, "")}/${data.key}`;
    }
    throw new Error("Upload successful but no valid URL returned");
}

export function useProviderOnboarding() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { currentUser, setCurrentUser } = useUIStore();

    const [uploading, setUploading] = useState(false);
    const [gettingLoc, setGettingLoc] = useState(false);
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<any>({});

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        altPhone: "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        latitude: 0,
        longitude: 0,
        providerType: "BOTH", // Matches the default in your logic
    });

    // --- 1. FETCH PROFILE DATA ---
    const { isLoading: isFetchingProfile } = useQuery({
        queryKey: ["userProfile", currentUser?.id],
        queryFn: async () => {
            const res = await fetch(`/api/user/profile?identifier=${currentUser?.id}`);
            if (!res.ok) throw new Error("Failed to fetch profile");
            const data = await res.json();

            // Sync fetched data to local form state
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

            if (data.img || data.profileImage) {
                setImgPreview(data.profileImage || data.img);
            }

            return data;
        },
        enabled: !!currentUser?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // --- 2. SUBMIT MUTATION ---
    const onboardingMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch("/api/provider/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser?.id,
                    ...payload,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: () => {
            // ✅ FIX: Ensure TS knows currentUser exists and satisfies the 'User' interface
            if (currentUser) {
                const updatedUser: User = {
                    ...currentUser,
                    id: currentUser.id, // Explicitly pass to satisfy required 'id'
                    isWorker: true,
                    isWebsite: false,
                    providerType: form.providerType, // Allowed by your interface (string | Union)
                };
                setCurrentUser(updatedUser);
            }

            queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] });
            router.push("/provider/dashboard?new=true");
        },
        onError: (error: any) => {
            if (error.issues) {
                const formattedErrors: any = {};
                error.issues.forEach((issue: any) => {
                    formattedErrors[issue.path[0]] = issue.message;
                });
                setErrors(formattedErrors);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                alert(error.message || "Something went wrong.");
            }
        },
    });

    // --- HANDLERS ---

    const handleChange = useCallback((field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    const handleGetLocation = useCallback(() => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported");
            return;
        }
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
                alert("Unable to retrieve location");
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
        } catch (err: any) {
            alert(err.message || "Image upload failed");
        } finally {
            setUploading(false);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            router.push("/login");
            return;
        }

        try {
            const payload = {
                ...form,
                profileImage: imgPreview || "",
                phone: form.altPhone,
            };

            onboardSchema.parse(payload);
            onboardingMutation.mutate(payload);
        } catch (error: any) {
            if (error.issues) {
                const formattedErrors: any = {};
                error.issues.forEach((issue: any) => {
                    formattedErrors[issue.path[0]] = issue.message;
                });
                setErrors(formattedErrors);
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