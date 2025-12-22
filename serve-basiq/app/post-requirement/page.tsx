'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { serviceCategories } from '@/lib/db';
import {
    FaBullhorn, FaRupeeSign, FaMapPin, FaArrowRight,
    FaCheck, FaArrowLeft
} from 'react-icons/fa6';
import clsx from 'clsx';

export default function PostRequirementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        budget: '',
        location: '',
    });

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        setLoading(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-commerce-50 flex items-center justify-center p-4">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                        <FaCheck />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Requirement Posted!</h1>
                    <p className="text-gray-500 mb-8">
                        Your requirement has been submitted. Matching service providers will contact you soon.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/"
                            className="bg-brand-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-700 transition"
                        >
                            Back to Home
                        </Link>
                        <button
                            onClick={() => { setSubmitted(false); setFormData({ title: '', description: '', category: '', budget: '', location: '' }); }}
                            className="text-brand-600 font-bold hover:underline"
                        >
                            Post Another Requirement
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-commerce-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-slate-900 mb-6 transition"
                >
                    <FaArrowLeft /> Back to home
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                        <FaBullhorn />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Post Your Requirement</h1>
                    <p className="text-gray-500">
                        Tell us what you need and we&apos;ll connect you with the right professionals
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                What do you need? *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                placeholder="e.g., Need AC repair, Looking for plumber"
                                required
                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Category *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => updateField('category', e.target.value)}
                                required
                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="">Select a category</option>
                                {serviceCategories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Describe your requirement *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Provide details about your requirement..."
                                required
                                rows={4}
                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Budget (Optional)
                                </label>
                                <div className="relative">
                                    <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.budget}
                                        onChange={(e) => updateField('budget', e.target.value)}
                                        placeholder="5000"
                                        className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Location *
                                </label>
                                <div className="relative">
                                    <FaMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => updateField('location', e.target.value)}
                                        placeholder="City, Area"
                                        required
                                        className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                            <h4 className="font-bold text-purple-900 mb-2">How it works</h4>
                            <ul className="text-sm text-purple-700 space-y-1">
                                <li>• Your requirement will be visible to verified providers</li>
                                <li>• Interested providers will contact you directly</li>
                                <li>• Compare quotes and choose the best option</li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formData.title || !formData.category || !formData.description || !formData.location}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Submit Requirement <FaArrowRight />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
