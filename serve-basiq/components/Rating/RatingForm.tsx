"use client";

import { useState, useRef } from "react";
import { FaStar, FaCamera, FaXmark } from "react-icons/fa6";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";

import { uploadToBackend } from "@/lib/uploadToBackend";
import { submitServiceReview } from "@/app/actions/reviews";
import { submitProductReview } from "@/app/actions/productReviews";
import { submitRentalReview } from "@/app/actions/rentalReviews";
import SuccessModal from "../ui/SuccessModal";

interface RatingFormProps {
    serviceId?: string;
    productId?: string;
    rentalId?: string;
    type?: 'SERVICE' | 'PRODUCT' | 'RENTAL';
}

export default function RatingForm({ serviceId, productId, rentalId, type }: RatingFormProps) { 
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const activeId = serviceId || productId || rentalId;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const selectedFiles = Array.from(e.target.files);

        if (images.length + selectedFiles.length > 5) {
            toast.error("You can only upload a maximum of 5 images.");
            return;
        }

        setIsCompressing(true);

        try {
            const compressedFiles = await Promise.all(
                selectedFiles.map(async (file) => {
                    const compressedBlob = await imageCompression(file, {
                        maxSizeMB: 0.05,          // ✅ Targets ~50 KB max
                        maxWidthOrHeight: 800,    // ✅ Reduced resolution to keep the 50KB image looking crisp
                        useWebWorker: true,
                        fileType: "image/webp",
                        initialQuality: 0.7       // ✅ Starts compression lower for faster processing
                    });

                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            const uploadedUrls: string[] = [];

            if (images.length > 0) {
                for (const image of images) {
                    const url = await uploadToBackend(image, "reviews");
                    uploadedUrls.push(url);
                }
            }
            
            const formData = new FormData();
            formData.append("rating", rating.toString());
            formData.append("comment", comment);
            formData.append("images", JSON.stringify(uploadedUrls));

            let res;

            if (type === 'PRODUCT' || productId) {
                formData.append("productId", activeId);
                res = await submitProductReview(formData);
            } else if (type === 'RENTAL' || rentalId) {
                formData.append("rentalId", activeId);
                res = await submitRentalReview(formData);
            } else {
                formData.append("serviceId", activeId);
                res = await submitServiceReview(formData);
            }

            if (res?.success) {
                setShowSuccessModal(true);
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