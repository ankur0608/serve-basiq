"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    FaXmark,
    FaCheck,
    FaSpinner,
    FaLocationDot,
    FaCity,
    FaBuilding
} from "react-icons/fa6";
import Input from "@/components/ui/Input";
import clsx from "clsx";

interface AddressEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: any;
    onSave: (data: any) => Promise<void>;
}

export default function AddressEditModal({ isOpen, onClose, initialData, onSave }: AddressEditModalProps) {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [fetchingPincode, setFetchingPincode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                id: initialData.id || "",
                type: initialData.type || "Home",
                addressLine1: initialData.line1 || initialData.addressLine1 || "",
                addressLine2: initialData.line2 || initialData.addressLine2 || "",
                landmark: initialData.landmark || "",
                city: initialData.city || "",
                district: initialData.district || "",
                state: initialData.state || "",
                pincode: initialData.pincode || "",
                country: initialData.country || "India",
            });
        }
    }, [isOpen, initialData]);

    const handlePincodeChange = async (value: string) => {
        const numericValue = value.replace(/\D/g, "");
        setFormData((prev: any) => ({ ...prev, pincode: numericValue }));

        if (numericValue.length === 6) {
            setFetchingPincode(true);
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${numericValue}`);
                const data = await response.json();

                if (data && data[0].Status === "Success") {
                    const details = data[0].PostOffice[0];
                    setFormData((prev: any) => ({
                        ...prev,
                        state: details.State,
                        district: details.District,
                        city: details.Block !== "NA" ? details.Block : details.District,
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch pincode details", error);
            } finally {
                setFetchingPincode(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6" style={{ isolation: 'isolate' }}>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}></div>

            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[85dvh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                            {formData.id ? "Edit Address" : "Add New Address"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                        <FaXmark className="text-lg" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    <form id="address-form" onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Address Type</label>
                                <select
                                    className="w-full border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Home">Home</option>
                                    <option value="Office">Shop</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <Input label="Address Line 1" value={formData.addressLine1} onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })} icon={<FaLocationDot />} placeholder="House No., Building, Apartment" required />
                            </div>
                            <div className="col-span-2">
                                <Input label="Address Line 2" value={formData.addressLine2} onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} placeholder="Area, Colony, Road" />
                            </div>
                            <div className="col-span-2">
                                <Input label="Landmark" value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} placeholder="e.g. Near City Mall" />
                            </div>

                            <Input label="Pincode" value={formData.pincode} onChange={(e) => handlePincodeChange(e.target.value)} maxLength={6} required rightElement={fetchingPincode && <FaSpinner className="animate-spin text-blue-600 text-xs" />} />
                            <Input label="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} icon={<FaCity />} required />
                            <Input label="District" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} icon={<FaBuilding />} />
                            <Input label="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required />
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex gap-3 shrink-0">
                    <button type="button" onClick={onClose} disabled={loading} className="flex-1 py-3 rounded-xl border border-gray-300 font-bold hover:bg-white transition text-sm sm:text-base">Cancel</button>
                    <button type="submit" form="address-form" disabled={loading} className={clsx("flex-2 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm sm:text-base text-white", loading ? "bg-gray-400 cursor-not-allowed" : "bg-slate-900 hover:bg-black")}>
                        {loading ? <FaSpinner className="animate-spin" /> : <><FaCheck /> Save Address</>}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}