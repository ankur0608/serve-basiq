// components/ContactContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast'; // ✅ Imported toast

export default function ContactContent() {
    const { data: session } = useSession();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: 'General inquiry',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-fill name and email if the user is logged in
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || prev.name,
                email: session.user.email || prev.email,
            }));
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // ✅ Using a toast promise for a great loading UX
        const submitPromise = fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                userId: (session?.user as any)?.id || null
            })
        }).then(async (res) => {
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Failed to send message.');
            return data;
        });

        toast.promise(submitPromise, {
            loading: 'Sending your message...',
            success: () => {
                // Reset form text on success
                setFormData(prev => ({ ...prev, message: '', category: 'General inquiry' }));
                return 'Message sent successfully! We will be in touch.';
            },
            error: (err) => err.message || 'An error occurred. Please try again.',
        });

        submitPromise.finally(() => {
            setIsSubmitting(false);
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <main>
                {/* HERO */}
                <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
                        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/20 text-sm font-medium">
                            Contact & Support
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                            We’re Here to Help
                        </h1>
                        <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto">
                            Have a question about <strong>nearby services or products</strong>?
                            Send us a message and we’ll get back to you soon.
                        </p>
                    </div>
                </section>

                {/* CONTENT */}
                <section className="max-w-5xl mx-auto px-4 py-20">
                    <div className="bg-white rounded-3xl shadow-md p-8 md:p-10">
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* LEFT INFO */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Contact ServeBasiq</h2>
                                    <p className="text-slate-600 leading-relaxed">
                                        You can contact us for anything related to services, products,
                                        listings, or general questions.
                                    </p>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <p className="text-sm text-slate-500 mb-1">Contact email</p>
                                    <p className="text-base font-semibold text-slate-800">
                                       info@servebasiq.com
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        We usually respond within 24 hours
                                    </p>
                                </div>

                                <ul className="text-slate-600 space-y-2">
                                    <li>• Nearby services inquiry</li>
                                    <li>• Product seller onboarding</li>
                                    <li>• Service provider listing</li>
                                    <li>• Feedback or suggestions</li>
                                </ul>
                            </div>

                            {/* FORM */}
                            <div>
                                <h2 className="text-xl font-semibold mb-2">Send us a message</h2>
                                <p className="text-sm text-slate-500 mb-6">
                                    This will only take a moment.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Your name"
                                        className="w-full px-5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                                        disabled={isSubmitting}
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Your email"
                                        className="w-full px-5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                                        disabled={isSubmitting}
                                    />
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400"
                                        disabled={isSubmitting}
                                    >
                                        <option>General inquiry</option>
                                        <option>Service provider listing</option>
                                        <option>Product seller listing</option>
                                        <option>Technical support</option>
                                        <option>Feedback</option>
                                    </select>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        placeholder="Your message"
                                        className="w-full px-5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                                        disabled={isSubmitting}
                                    ></textarea>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </button>
                                    <p className="text-xs text-slate-500 text-center">
                                        Your information is only used to reply to you.
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}