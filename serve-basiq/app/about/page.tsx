import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About ServeBasiq | Nearby Services & Products',
    description: 'ServeBasiq helps you discover nearby services and products available around you. Simple, local, and reliable.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

            <main>
                {/* HERO */}
                <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
                        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/20 text-sm font-medium">
                            Nearby Services & Products Platform
                        </span>

                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                            Find What You Need,<br className="hidden sm:block" />
                            Right Near You
                        </h1>

                        <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto">
                            ServeBasiq helps you discover <strong>nearby services and products</strong> available on our website — without confusion, delays, or endless searching.
                        </p>
                    </div>
                </section>

                {/* CONTENT */}
                <div className="max-w-5xl mx-auto px-4 py-20 space-y-24">

                    {/* STORY */}
                    <section className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Why ServeBasiq Exists</h2>
                        <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
                            Finding a trusted service or product nearby shouldn’t feel hard.
                            Yet people still rely on calls, WhatsApp forwards, or random searches.
                        </p>
                        <p className="text-slate-600 text-lg max-w-3xl mx-auto mt-4 leading-relaxed">
                            ServeBasiq was created to fix that — by bringing
                            <strong> nearby services & products</strong> into one clean, easy platform.
                        </p>
                    </section>

                    {/* SERVICES / PRODUCTS */}
                    <section className="grid sm:grid-cols-2 gap-10">
                        <div className="bg-white rounded-3xl p-10 shadow-md hover:shadow-xl transition-shadow">
                            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Services</span>
                            <h3 className="text-2xl font-bold mt-2 mb-4">Nearby Services</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Home services, repairs, maintenance, rentals, professional work —
                                all listed by local service providers near you.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-10 shadow-md hover:shadow-xl transition-shadow">
                            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Products</span>
                            <h3 className="text-2xl font-bold mt-2 mb-4">Nearby Products</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Products from nearby sellers and suppliers,
                                making local discovery easier and faster.
                            </p>
                        </div>
                    </section>

                    {/* HOW IT HELPS */}
                    <section>
                        <h2 className="text-3xl font-bold text-center mb-12">How ServeBasiq Helps</h2>
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-semibold mb-4">For Users</h3>
                                <ul className="space-y-3 text-slate-600">
                                    <li>• Discover nearby services & products</li>
                                    <li>• Save time with location-based results</li>
                                    <li>• Contact providers directly</li>
                                    <li>• Clean, mobile-friendly experience</li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-semibold mb-4">For Providers & Sellers</h3>
                                <ul className="space-y-3 text-slate-600">
                                    <li>• List services or products online</li>
                                    <li>• Reach nearby customers</li>
                                    <li>• Grow digitally without complexity</li>
                                    <li>• Simple listing management</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* MISSION / VISION */}
                    <section className="grid sm:grid-cols-2 gap-10">
                        <div className="bg-gradient-to-br from-white to-slate-100 rounded-3xl p-8 border border-slate-200">
                            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Make nearby services and products easy to discover,
                                while empowering local businesses to grow digitally.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-white to-slate-100 rounded-3xl p-8 border border-slate-200">
                            <h3 className="text-xl font-bold mb-3">Our Vision</h3>
                            <p className="text-slate-600 leading-relaxed">
                                A future where people rely on ServeBasiq
                                for everything they need around them.
                            </p>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2.5rem] p-12 text-center shadow-xl">
                        <h2 className="text-3xl font-extrabold mb-4">
                            Start Exploring What’s Near You
                        </h2>
                        <p className="text-indigo-100 text-lg mb-8">
                            Services or products — everything nearby, in one place.
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-2xl font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Explore ServeBasiq
                        </Link>
                    </section>
                </div>
            </main>

        </div>
    );
}