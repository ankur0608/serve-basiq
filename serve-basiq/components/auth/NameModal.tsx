"use client";

import { useState, useEffect } from "react";
import { FaSpinner, FaRegUser } from "react-icons/fa6";
import clsx from "clsx";
import { useUIStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface NameModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NameModal({ isOpen, onClose }: NameModalProps) {
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    // ✅ Get Session Data (we need userId for your API)
    const { data: session, update } = useSession();

    const loginIntent = useUIStore((state) => state.loginIntent);
    const onCloseName = useUIStore((state) => state.onCloseName);

    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setShowModal(false), 300);
            document.body.style.overflow = "unset";
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || name.trim().length < 2) {
            setError("Please enter a valid name");
            return;
        }

        // ✅ Check if we have a user ID (Required by your API)
        const userId = (session?.user as any)?.id;
        if (!userId) {
            setError("Session error. Please try logging in again.");
            return;
        }

        setIsLoading(true);

        try {
            // ✅ CALL EXISTING PROFILE API
            const res = await fetch("/api/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId, // Required by your API logic
                    name
                }),
            });

            if (!res.ok) throw new Error("Failed to update name");

            // Update local session so we don't need to refresh page to see the name
            await update({ name });

            onCloseName(); // Close this modal

            // ✅ FINAL REDIRECT
            if (loginIntent === 'provider') {
                router.push('/become-pro');
            } else {
                router.refresh();
            }

        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen && !showModal) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className={clsx("fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} />

                <div className={clsx("relative w-full max-w-md bg-white rounded-3xl shadow-2xl text-left transform transition-all duration-300", isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4")}>

                    {/* No Close Button - Forced Step */}
                    <div className="p-8">
                        <div className="text-center mb-6 mt-2">
                            <h2 className="text-2xl font-extrabold text-slate-900">What's your name?</h2>
                            <p className="text-sm text-gray-500 mt-2">Please enter your full name to continue.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Full Name</label>
                                <div className="relative group">
                                    <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setError("");
                                        }}
                                        placeholder="Ex. John Doe"
                                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl outline-none font-bold text-slate-900 placeholder-gray-300 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                                        disabled={isLoading}
                                    />
                                </div>
                                {error && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{error}</p>}
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-black transition flex items-center justify-center gap-2">
                                {isLoading ? <FaSpinner className="animate-spin" /> : "Continue"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}