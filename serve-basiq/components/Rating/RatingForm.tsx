"use client";

import { useState, useRef } from "react";
import { FaStar, FaCamera, FaXmark } from "react-icons/fa6";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast"; // ✅ Imported toast

// 🌟 Import your shiny new reusable upload function!
import { uploadToBackend } from "@/lib/uploadToBackend";

// Import actions (Make sure these paths match your project structure!)
import { submitServiceReview } from "@/app/actions/reviews";
import { submitProductReview } from "@/app/actions/productReviews";
import { submitRentalReview } from "@/app/actions/rentalReviews";

import SuccessModal from "../ui/SuccessModal";

interface RatingFormProps {
    serviceId?: string;
    productId?: string;
    rentalId?: string;
}

export default function RatingForm({ serviceId, productId, rentalId }: RatingFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const activeId = serviceId || productId || rentalId;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 📸 Handles selecting images, shrinking them, and converting to WebP
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const selectedFiles = Array.from(e.target.files);

        // Limit to 5 images total
        if (images.length + selectedFiles.length > 5) {
            toast.error("You can only upload a maximum of 5 images."); 
            return;
        }

        setIsCompressing(true);

        try {
            const compressedFiles = await Promise.all(
                selectedFiles.map(async (file) => {
                    // Compress and convert to WebP
                    const compressedBlob = await imageCompression(file, {
                        maxSizeMB: 0.8, // 800KB max per image
                        maxWidthOrHeight: 1920,
                        useWebWorker: true,
                        fileType: "image/webp", // Force WebP format
                    });

                    // Rename the file to ensure it has a .webp extension
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

                    // Convert Blob back to a standard File object
                    return new File([compressedBlob], newFileName, {
                        type: "image/webp",
                    });
                })
            );

            setImages((prev) => [...prev, ...compressedFiles]);
        } catch (error) {
            console.error("Error compressing images:", error);
            toast.error("Failed to process images. Please try again.");
        } finally {
            setIsCompressing(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    // 📤 Handles the final form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Replaced alerts and fixed return statements
        if (rating === 0) {
            toast.error("Please select a star rating!");
            return;
        }
        if (!activeId) {
            toast.error("Error: No ID provided for review.");
            return;
        }

        setLoading(true);

        try {
            // 1️⃣ Upload compressed WebP images directly to R2 first
            const uploadedUrls: string[] = [];

            if (images.length > 0) {
                // Uploading one by one to ensure reliability
                for (const image of images) {
                    const url = await uploadToBackend(image);
                    uploadedUrls.push(url);
                }
            }

            // 2️⃣ Prepare FormData with lightweight text/URLs, NOT files
            const formData = new FormData();
            formData.append("rating", rating.toString());
            formData.append("comment", comment);

            // Pass the array of R2 URLs as a JSON string!
            // E.g. '["https://pub-xxx.r2.dev/img1.webp", "https://pub-xxx.r2.dev/img2.webp"]'
            formData.append("images", JSON.stringify(uploadedUrls));

            let res;

            // 3️⃣ Call the correct Server Action based on the active ID
            if (serviceId) {
                formData.append("serviceId", activeId);
                res = await submitServiceReview(formData);
            } else if (productId) {
                formData.append("productId", activeId);
                res = await submitProductReview(formData);
            } else if (rentalId) {
                formData.append("rentalId", activeId);
                res = await submitRentalReview(formData);
            }

            // 4️⃣ Handle Success
            if (res?.success) {
                setShowSuccessModal(true);
                // Reset Form completely
                setRating(0);
                setComment("");
                setImages([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                toast.error(res?.error || "Something went wrong."); 
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!activeId) return null;

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900">Leave a Review</h4>

                {/* Star Rating */}
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="focus:outline-none transition-transform active:scale-95"
                        >
                            <FaStar
                                size={28}
                                className={`${(hover || rating) >= star ? "text-amber-500" : "text-slate-300"} transition-colors`}
                            />
                        </button>
                    ))}
                </div>

                {/* Comment Box */}
                <textarea
                    className="w-full p-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Share your experience..."
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />

                {/* Image Upload Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isCompressing || loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                            {isCompressing ? <Loader2 className="animate-spin text-slate-400" size={16} /> : <FaCamera className="text-slate-400" />}
                            {isCompressing ? "Processing..." : "Add Photos"}
                        </button>
                        <span className="text-xs text-slate-400">
                            {images.length} / 5 selected
                        </span>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                    />

                    {/* Image Previews */}
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {images.map((file, index) => (
                                <div key={index} className="relative w-20 h-20 group">
                                    <Image
                                        src={URL.createObjectURL(file)}
                                        alt="Preview"
                                        width={80}
                                        height={80}
                                        className="w-full h-full object-cover rounded-lg border border-slate-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        disabled={loading}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        <FaXmark size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    disabled={loading || isCompressing}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin" size={16} />}
                    {loading ? "Posting Review..." : "Submit Review"}
                </button>
            </form>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Review Submitted!"
                message="Thank you for your feedback."
                buttonText="Close"
            />
        </>
    );
}