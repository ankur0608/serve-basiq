import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Contact ServeBasiq | Nearby Services & Products',
    description: 'Contact ServeBasiq for questions about nearby services and products. We usually respond within 24 hours.',
};

export default function ContactPage() {
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

                                <form className="space-y-5">
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        className="w-full px-5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        className="w-full px-5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                    <select className="w-full px-5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white">
                                        <option>General inquiry</option>
                                        <option>Service provider listing</option>
                                        <option>Product seller listing</option>
                                        <option>Technical support</option>
                                        <option>Feedback</option>
                                    </select>
                                    <textarea
                                        rows={3}
                                        placeholder="Your message"
                                        className="w-full px-5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    ></textarea>
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                                    >
                                        Send Message
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