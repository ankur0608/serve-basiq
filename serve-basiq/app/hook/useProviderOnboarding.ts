import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onboardSchema } from "@/lib/validators";
import { useUIStore } from "@/lib/store";

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
    const { currentUser, setCurrentUser } = useUIStore();

    const [loading, setLoading] = useState(false);
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
        // ✅ ADDED: Provider Type State
        providerType: "BOTH",
    });

    // --- FETCH EXISTING DATA ---
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!currentUser?.id) return;
            try {
                const res = await fetch(`/api/user/profile?identifier=${currentUser.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const addr = data.addresses?.find((a: any) => a.type === 'Home') || data.addresses?.[0];

                    setForm(prev => ({
                        ...prev,
                        fullName: data.name || prev.fullName,
                        email: data.email || prev.email,
                        altPhone: data.phone || prev.altPhone,
                        // ✅ Pre-fill provider type if exists
                        providerType: data.providerType || prev.providerType,
                        addressLine1: addr?.line1 || prev.addressLine1,
                        addressLine2: addr?.line2 || prev.addressLine2,
                        landmark: addr?.landmark || prev.landmark,
                        city: addr?.city || prev.city,
                        state: addr?.state || prev.state,
                        pincode: addr?.pincode || prev.pincode,
                    }));

                    if (data.img || data.profileImage) setImgPreview(data.profileImage || data.img);
                }
            } catch (error) {
                console.error("Failed to load profile data:", error);
            }
        };
        fetchProfileData();
    }, [currentUser]);

    // --- HANDLERS ---

    // Stable handler for inputs
    const handleChange = useCallback((field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Clear error for this field if exists
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
            alert("Geolocation is not supported by your browser");
            return;
        }

        setGettingLoc(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setForm(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                setGettingLoc(false);
            },
            (error) => {
                console.error(error);
                alert("Unable to retrieve your location. Please allow GPS access.");
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
            setErrors((prev: any) => {
                const newErrors = { ...prev };
                delete newErrors.profileImage;
                return newErrors;
            });
        } catch (err: any) {
            console.error("Upload Error:", err);
            alert(err.message || "Image upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            router.push('/login');
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const payload = {
                ...form,
                profileImage: imgPreview || "",
                phone: form.altPhone,
                // providerType is already in 'form'
            };

            // NOTE: If onboardSchema doesn't accept providerType, parse might strip it 
            // or throw an error depending on Zod configuration. 
            // Ensure Validators are updated, or we rely on the backend extracting it manually.
            onboardSchema.parse(payload);

            const res = await fetch("/api/provider/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.id,
                    ...payload // Payload includes providerType
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");

            // Update local user state
            setCurrentUser({
                ...currentUser,
                isWorker: true,
                isWebsite: false,
                providerType: form.providerType // Update local state too
            });

            router.push("/provider/dashboard?new=true");

        } catch (error: any) {
            console.error("Submission Error:", error);
            if (error.issues) {
                const formattedErrors: any = {};
                error.issues.forEach((issue: any) => {
                    formattedErrors[issue.path[0]] = issue.message;
                });
                setErrors(formattedErrors);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert(error.message || "Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        loading,
        uploading,
        gettingLoc,
        imgPreview,
        errors,
        handleChange,
        handleGetLocation,
        handleImageUpload,
        handleSubmit
    };
}