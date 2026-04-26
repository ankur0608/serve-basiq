import React from 'react';
import Link from 'next/link';

const LAST_UPDATED = 'April 19, 2026';

export default function PrivacyPolicyContent() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <main>
                {/* HERO */}
                <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
                        <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/20 text-sm font-semibold tracking-wide">
                            Privacy Policy
                        </span>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                            Your Privacy Matters
                        </h1>

                        <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
                            This page explains how ServeBasiq collects, uses,
                            and protects your information when you use our platform.
                        </p>

                        <p className="mt-6 text-sm text-indigo-200">
                            Last updated: {LAST_UPDATED}
                        </p>
                    </div>
                </section>

                {/* CONTENT */}
                <div className="max-w-4xl mx-auto px-4 py-20 space-y-16">
                    {/* INTRO */}
                    <section className="text-center">
                        <p className="text-slate-600 text-lg leading-relaxed">
                            ServeBasiq respects your privacy and is committed to protecting
                            your personal information. This Privacy Policy outlines
                            what data we collect, how we use it, and the choices you have.
                        </p>
                    </section>

                    {/* POLICY SECTIONS */}
                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Information We Collect
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                When you use ServeBasiq, we may collect the following information:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 space-y-3">
                                <li>Account details such as name, email address, phone number, and profile image</li>
                                <li>Location information (with your permission) to show nearby services and products</li>
                                <li>Information you provide through contact forms, inquiries, or listings</li>
                                <li>Business and KYC details if you register as a provider or seller</li>
                                <li>Basic usage data and device information to improve the platform experience</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                How We Use Your Information
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                We use your information only for legitimate platform purposes, including:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 space-y-3">
                                <li>Connecting users with nearby service providers, product sellers, and rental businesses</li>
                                <li>Processing bookings, orders, and requirement requests</li>
                                <li>Responding to your inquiries and support requests</li>
                                <li>Verifying provider identity and preventing fraud or misuse</li>
                                <li>Improving platform features, usability, and performance</li>
                                <li>Sending occasional service updates or important notifications</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Data Sharing
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                ServeBasiq does not sell, rent, or trade your personal information.
                                Limited data may be shared with providers you contact (for example, your name and city
                                so they can respond to your request), with trusted service infrastructure
                                (hosting, analytics, payment processing), or when required by law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Cookies & Tracking
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                ServeBasiq uses cookies and similar technologies to keep you signed in,
                                remember your preferences, and understand how the platform is used.
                                You can control cookies through your browser settings, although disabling
                                them may affect some features.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Data Security
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                We take reasonable technical and organizational steps to protect your
                                information from unauthorized access, misuse, or disclosure. This includes
                                encrypted connections, access controls, and regular security reviews.
                                No online platform can guarantee complete security, but we work continuously
                                to minimize risk.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Third-Party Services
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                ServeBasiq may use third-party tools or services (such as authentication
                                providers, maps, image hosting, and analytics) to support platform
                                functionality. These services operate under their own privacy policies,
                                and we only share the minimum data required for the service to function.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Children’s Privacy
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                ServeBasiq is not directed to children under 13, and we do not knowingly
                                collect personal information from them. If you believe a child has provided
                                us with personal information, please contact us so we can remove it.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Your Rights
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                You have the right to request access to, correction of, or deletion of
                                your personal information. You can also ask us to stop using your data
                                for specific purposes. To exercise any of these rights, contact us using
                                the details below and we will respond within a reasonable timeframe.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Changes to This Policy
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                We may update this Privacy Policy from time to time as the platform evolves.
                                When we do, we will update the “Last updated” date at the top of this page.
                                For significant changes, we may notify you through the app or by email.
                            </p>
                        </section>
                    </div>

                    {/* CONTACT BOX */}
                    <section className="bg-slate-100 rounded-3xl p-10 text-center border border-slate-200">
                        <h2 className="text-2xl font-bold mb-3 text-slate-900">
                            Contact Us
                        </h2>
                        <p className="text-slate-600 mb-6 max-w-lg mx-auto leading-relaxed">
                            If you have any questions or concerns about this Privacy Policy,
                            feel free to reach out.
                        </p>
                        <div className="inline-block bg-white px-8 py-3 rounded-2xl shadow-sm border border-slate-200">
                            <a
                                href="mailto:servebasiq@gmail.com"
                                className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                servebasiq@gmail.com
                            </a>
                        </div>
                    </section>

                    {/* CROSS-LINKS FOOTER */}
                    <section className="text-center pt-8 border-t border-slate-200">
                        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                            <Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <Link href="/faq" className="hover:text-indigo-600 transition-colors">FAQ</Link>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <Link href="/careers" className="hover:text-indigo-600 transition-colors">Careers</Link>
                        </nav>
                    </section>
                </div>
            </main>
        </div>
    );
}
