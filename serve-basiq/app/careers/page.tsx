import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Careers at ServeBasiq | Nearby Services & Products',
    description: "Careers at ServeBasiq. We’re not hiring right now, but we’re always open to connecting with people who care about building useful products.",
};

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
           
            <main>
                {/* HERO */}
                <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
                        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/20 text-sm font-medium">
                            Careers
                        </span>

                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                            Building Useful Products<br className="hidden sm:block" />
                            for Everyday Needs
                        </h1>

                        <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto">
                            ServeBasiq is focused on making it easier for people to discover
                            <strong> nearby services and products</strong> in a simple, reliable way.
                        </p>
                    </div>
                </section>

                {/* CONTENT */}
                <section className="max-w-5xl mx-auto px-4 py-20 space-y-16">

                    {/* ABOUT WORK */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">
                            Working at ServeBasiq
                        </h2>
                        <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
                            We’re a small, focused team working on real problems that affect everyday life.
                            Our approach is simple: build clean, useful experiences that help local businesses
                            and make things easier for users.
                        </p>
                    </div>

                    {/* VALUES / WORK STYLE */}
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-semibold mb-2">Thoughtful Work</h3>
                            <p className="text-slate-600 leading-relaxed">
                                We value clarity, simplicity, and long-term thinking over rushed features
                                or unnecessary complexity.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-semibold mb-2">Real Impact</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Everything we build is meant to support local services and real people,
                                not vanity metrics.
                            </p>
                        </div>
                    </div>

                    {/* NOT HIRING STATUS */}
                    <div className="bg-slate-100 rounded-2xl p-8 text-center border border-slate-200">
                        <h2 className="text-xl font-semibold mb-2 text-slate-900">
                            We’re Not Hiring Right Now
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-sm leading-relaxed">
                            We don’t have any open roles at the moment.
                            Right now, our focus is on building and refining ServeBasiq.
                        </p>
                    </div>

                    {/* STAY CONNECTED */}
                    <div className="bg-white rounded-2xl p-10 shadow-sm text-center border border-slate-100">
                        <h2 className="text-xl font-semibold mb-2">
                            Stay in Touch
                        </h2>
                        <p className="text-slate-600 mb-6 max-w-2xl mx-auto text-sm leading-relaxed">
                            If you’d like to connect, share your profile, or simply say hello,
                            feel free to reach out.
                        </p>

                        <div className="bg-indigo-50 rounded-xl p-4 inline-block border border-indigo-100">
                            <p className="text-sm font-semibold text-indigo-700">
                                info@servebasiq.com
                            </p>
                        </div>
                    </div>

                </section>
            </main>


        </div>
    );
}