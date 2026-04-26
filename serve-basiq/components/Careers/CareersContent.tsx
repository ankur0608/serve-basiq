import React from 'react';
import Link from 'next/link';

export default function CareersContent() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <main>
                {/* HERO */}
                <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
                        <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/20 text-sm font-semibold tracking-wide">
                            Careers
                        </span>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                            Building Useful Products<br className="hidden sm:block" />
                            for Everyday Needs
                        </h1>

                        <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
                            ServeBasiq is focused on making it easier for people to discover
                            <strong> nearby services, products, and rentals</strong> in a simple, reliable way.
                        </p>
                    </div>
                </section>

                {/* CONTENT */}
                <div className="max-w-5xl mx-auto px-4 py-20 space-y-20">

                    {/* ABOUT WORK */}
                    <section className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
                            Working at ServeBasiq
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            We’re a small, focused team working on real problems that affect everyday life.
                            Our approach is simple: build clean, useful experiences that help local businesses
                            and make things easier for users.
                        </p>
                    </section>

                    {/* VALUES / WORK STYLE */}
                    <section>
                        <h2 className="sr-only">What We Value</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all border border-slate-100">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 w-max px-3 py-1 rounded-full mb-4 inline-block">Craft</span>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Thoughtful Work</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    We value clarity, simplicity, and long-term thinking over rushed features
                                    or unnecessary complexity.
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all border border-slate-100">
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 w-max px-3 py-1 rounded-full mb-4 inline-block">Impact</span>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Real Impact</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    Everything we build is meant to support local services and real people,
                                    not vanity metrics.
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all border border-slate-100">
                                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 w-max px-3 py-1 rounded-full mb-4 inline-block">Ownership</span>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">Own the Outcome</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    Small team, broad scope. Every person ships, owns their work end to end,
                                    and sees how it affects users.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* NOT HIRING STATUS */}
                    <section className="bg-slate-100 rounded-3xl p-10 text-center border border-slate-200">
                        <h2 className="text-2xl font-bold mb-3 text-slate-900">
                            We’re Not Hiring Right Now
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            We don’t have any open roles at the moment. Our focus is on building and
                            refining ServeBasiq. If and when we open roles, they’ll be listed here first.
                        </p>
                    </section>

                    {/* STAY CONNECTED */}
                    <section className="bg-white rounded-3xl p-10 shadow-sm text-center border border-slate-100">
                        <h2 className="text-2xl font-bold mb-3 text-slate-900">
                            Stay in Touch
                        </h2>
                        <p className="text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                            If you’d like to connect, share your profile, or simply say hello,
                            feel free to reach out. We save every thoughtful note we receive.
                        </p>

                        <a
                            href="mailto:servebasiq@gmail.com"
                            className="inline-block bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                            servebasiq@gmail.com
                        </a>
                    </section>

                    {/* CROSS-LINKS FOOTER */}
                    <section className="text-center pt-8 border-t border-slate-200">
                        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                            <Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <Link href="/faq" className="hover:text-indigo-600 transition-colors">FAQ</Link>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
                        </nav>
                    </section>

                </div>
            </main>
        </div>
    );
}
