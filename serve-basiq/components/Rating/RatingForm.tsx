"use client";

import { useState, useRef } from "react";
import { FaStar, FaCamera, FaXmark } from "react-icons/fa6";
import Image from "next/image";

// Import actions
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
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const activeId = serviceId || productId || rentalId;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Debugging Props on Mount
    // console.log("🛠️ [CLIENT] RatingForm mounted. Props:", { serviceId, productId, rentalId, activeId });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (images.length + selectedFiles.length > 5) {
                alert("You can only upload a maximum of 5 images.");
                return;
            }
            setImages((prev) => [...prev, ...selectedFiles]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("🚀 [CLIENT] Submit clicked.");

        if (rating === 0) {
            console.warn("⚠️ [CLIENT] Validation Failed: No rating selected");
            return alert("Please select a star rating!");
        }
        if (!activeId) {
            console.error("❌ [CLIENT] Critical Error: No Active ID found");
            return alert("Error: No ID provided for review.");
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("serviceId", activeId);
            formData.append("rating", rating.toString());
            formData.append("comment", comment);

            images.forEach((image) => {
                formData.append("images", image);
            });

            console.log("📡 [CLIENT] Sending FormData:", {
                serviceId: activeId,
                rating,
                comment,
                imagesCount: images.length
            });

            let res;

            if (serviceId) {
                console.log("👉 [CLIENT] Calling submitServiceReview...");
                res = await submitServiceReview(formData);
            } else if (productId) {
                console.log("👉 [CLIENT] Calling submitProductReview...");
                res = await submitProductReview(formData);
            } else if (rentalId) {
                console.log("👉 [CLIENT] Calling submitRentalReview...");
                res = await submitRentalReview(formData);
            } else {
                throw new Error("Unknown review type");
            }

            console.log("🔙 [CLIENT] Server Response:", res);

            if (res?.success) {
                console.log("✅ [CLIENT] Success! Opening Modal.");
                setShowSuccessModal(true);
                setRating(0);
                setComment("");
                setImages([]);
            } else {
                console.error("❌ [CLIENT] Server returned error:", res?.error);
                alert(res?.error || "Something went wrong.");
            }
        } catch (error) {
            console.error("💥 [CLIENT] Exception caught:", error);
            alert("Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    if (!activeId) {
        console.error("❌ [CLIENT] Render aborted: Missing activeId");
        return null;
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-900">Leave a Review</h4>

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

                <textarea
                    className="w-full p-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Share your experience..."
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <FaCamera className="text-slate-400" />
                            Add Photos
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
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                                    >
                                        <FaXmark size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? "Posting..." : "Submit Review"}
                </button>
            </form>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Review Submitted!"
                message="Thank you for your feedback. Your review helps others make better decisions."
                buttonText="Close"
            />
        </>
    );
}