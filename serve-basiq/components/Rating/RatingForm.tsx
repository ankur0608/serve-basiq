"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa6";
import { submitServiceReview } from "@/app/actions/reviews";

export default function RatingForm({ serviceId }: { serviceId: string }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return alert("Please select a star rating!");

        setLoading(true);
        const res = await submitServiceReview(serviceId, rating, comment);

        if (res.success) {
            setRating(0);
            setComment("");
            alert("Review submitted successfully!");
        } else {
            alert(res.error);
        }
        setLoading(false);
    };

    return (
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
                    >
                        <FaStar
                            size={24}
                            className={`${(hover || rating) >= star ? "text-amber-500" : "text-slate-300"} transition-colors`}
                        />
                    </button>
                ))}
            </div>
            <textarea
                className="w-full p-3 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your experience..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
            />
            <button
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50"
            >
                {loading ? "Posting..." : "Submit Review"}
            </button>
        </form>
    );
}