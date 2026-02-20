'use client';

import React, { useState, useEffect } from 'react';
import { FaXmark } from 'react-icons/fa6';
import Input from '@/components/ui/Input'; // Adjust this path if your Input component is located elsewhere

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: any;
    onSave: (data: any) => void;
}

export default function AddressModal({ isOpen, onClose, initialData, onSave }: AddressModalProps) {
    const [formData, setFormData] = useState({
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
    });

    // Sync state when modal opens or initialData changes
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                addressLine1: initialData.addressLine1 || '',
                addressLine2: initialData.addressLine2 || '',
                landmark: initialData.landmark || '',
                city: initialData.city || '',
                district: initialData.district || '',
                state: initialData.state || '',
                pincode: initialData.pincode || '',
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing modal
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900">
                        {initialData?.addressLine1 ? 'Edit Address' : 'Add New Address'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <FaXmark size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form id="address-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                    <Input
                        label="Address Line 1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        placeholder="House No, Building, Street"
                        required
                    />

                    <Input
                        label="Address Line 2 (Optional)"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        placeholder="Apartment, Suite, Unit"
                    />

                    <Input
                        label="Landmark (Optional)"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleChange}
                        placeholder="e.g. Near Apollo Hospital"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            required
                        />
                        <Input
                            label="District"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            placeholder="District"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="State"
                            required
                        />
                        <Input
                            label="Pincode"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="e.g. 110001"
                            type="text"
                            inputMode="numeric"
                            required
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-slate-50 flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-white transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="address-form"
                        className="flex-[2] bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition shadow-md"
                    >
                        Save Address
                    </button>
                </div>
            </div>
        </div>
    );
}