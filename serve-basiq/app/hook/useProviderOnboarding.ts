import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import imageCompression from 'browser-image-compression';
import { onboardSchema } from "@/lib/validators";
import { useUIStore, User } from "@/lib/store";
import toast from "react-hot-toast";
import { uploadToBackend } from "@/lib/uploadToBackend";
import { useSession } from "next-auth/react";

const MAX_FRONTEND_SIZE_MB = 10;
const COMPRESSION_OPTIONS = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/webp" as const
};

export function useProviderOnboarding() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { currentUser, setCurrentUser } = useUIStore();

    const [uploading, setUploading] = useState(false);
    const [gettingLoc, setGettingLoc] = useState(false);
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { update } = useSession(); 
    
    // ✅ ADDED: Ref to silently hold the real R2 URL for the database
    const finalImageUrl = useRef<string | null>(null);

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
        shopName: "",
    });

    useEffect(() => {
        const checkDuplicatePhone = async () => {
            if (form.altPhone.length === 10 && form.altPhone !== currentUser?.phone) {
                try {
                    const res = await fetch(`/api/user/check-phone?phone=${form.altPhone}`);
                    const data = await res.json();

                    if (data.exists && data.userId !== currentUser?.id) {
                        toast.error("This mobile number is already registered to another account.");
                        setErrors(prev => ({ ...prev, altPhone: "Number already in use." }));
                    } else {
                        if (errors.altPhone === "Number already in use.") {
                            setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.altPhone;
                                return newErrors;
                            });
                        }
                    }
                } catch (error) {
                    console.error("Failed to check phone uniqueness", error);
                }
            }
        };

        const timeoutId = setTimeout(checkDuplicatePhone, 500);
        return () => clearTimeout(timeoutId);
    }, [form.altPhone, currentUser?.phone, currentUser?.id, errors.altPhone]);

    const { data: profileData, isLoading: isFetchingProfile } = useQuery({
        queryKey: ["userProfile", currentUser?.id],
        queryFn: async () => {
            if (!currentUser?.id) return null;
            const res = await fetch(`/api/user/profile?identifier=${currentUser.id}`);
            if (!res.ok) throw new Error("Failed to fetch profile");
            return await res.json();
        },
        enabled: !!currentUser?.id,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (profileData) {
            const addr = profileData.addresses?.find((a: any) => a.type === 'Home') || profileData.addresses?.[0];

            setForm(prev => ({
                ...prev,
                fullName: profileData.name || prev.fullName || "",
                email: profileData.email || prev.email || "",
                altPhone: profileData.phone || prev.altPhone || "",
                shopName: profileData.shopName || prev.shopName || "",
                addressLine1: addr?.line1 || prev.addressLine1,
                addressLine2: addr?.line2 || prev.addressLine2,
                landmark: addr?.landmark || prev.landmark,
                city: addr?.city || prev.city,
                district: addr?.district || prev.district,
                state: addr?.state || prev.state,
                pincode: addr?.pincode || prev.pincode,
            }));

            if (profileData.profileImage || profileData.img) {
                setImgPreview(profileData.profileImage || profileData.img);
            }
        }
    }, [profileData]);

    const onboardingMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch("/api/provider/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw data;
            return data;
        },
        onSuccess: async () => {
            if (currentUser) {
                const updatedUser: User = {
                    ...currentUser,
                    isWorker: true,
                    isWebsite: false,
                    profileImage: finalImageUrl.current || currentUser.profileImage,
                };
                setCurrentUser(updatedUser);
            }

            await update();

            await queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.id] });

            toast.success("Welcome aboard! Your profile is ready.");

            router.push("/provider/dashboard?new=true");

            setTimeout(() => router.refresh(), 100);
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
                toast.error(error.message || "Registration failed. Please try again.");
            }
        },
    });

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
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
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
                toast.error("Location access denied.");
                setGettingLoc(false);
            },
            { enableHighAccuracy: true }
        );
    }, []);

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FRONTEND_SIZE_MB * 1024 * 1024) {
            toast.error(`File is too large. Please select an image under ${MAX_FRONTEND_SIZE_MB}MB.`);
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Invalid file type. Please upload an image.");
            return;
        }

        try {
            setUploading(true);
            const compressedBlob = await imageCompression(file, COMPRESSION_OPTIONS);
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const uploadFile = new File([compressedBlob], newFileName, { type: 'image/webp' });

            // ✅ FIX 1: Instant Local Preview
            const localPreviewUrl = URL.createObjectURL(uploadFile);
            setImgPreview(localPreviewUrl); 

            // ✅ FIX 2: Background Upload & Ref Storage
            const remoteUrl = await uploadToBackend(uploadFile, "users");
            finalImageUrl.current = remoteUrl;

            if (errors.profileImage) {
                setErrors(prev => {
                    const n = { ...prev };
                    delete n.profileImage;
                    return n;
                });
            }
        } catch (err: any) {
            console.error("Upload Error:", err);
            toast.error(err.message || "Failed to process and upload image.");
        } finally {
            setUploading(false);
        }
    }, [errors]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) return router.push("/login");

        if (errors.altPhone) {
            toast.error("Please provide a valid, unused mobile number.");
            return;
        }

        try {
            const payload = {
                ...form,
                // ✅ FIX 3: Prioritize the uploaded R2 URL, fallback to existing preview
                profileImage: finalImageUrl.current || imgPreview || "",
                phone: form.altPhone,
            };

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