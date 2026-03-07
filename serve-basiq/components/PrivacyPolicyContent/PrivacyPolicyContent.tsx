// components/PrivacyPolicyContent.tsx
import React from 'react';

export default function PrivacyPolicyContent() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <main>
                {/* HERO */}
                <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
                        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/20 text-sm font-medium">
                            Privacy Policy
                        </span>

                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                            Your Privacy Matters
                        </h1>

                        <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto">
                            This page explains how ServeBasiq collects, uses,
                            and protects your information when you use our platform.
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
                            what data we collect and how we use it.
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
                                <li>Basic details such as name, email address, or contact information</li>
                                <li>Location information to show nearby services and products</li>
                                <li>Information you provide through contact forms or inquiries</li>
                                <li>Basic usage data to improve our platform experience</li>
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
                                <li>Connecting users with nearby service providers and product sellers</li>
                                <li>Responding to your inquiries and support requests</li>
                                <li>Improving platform features, usability, and performance</li>
                                <li>Maintaining platform safety and preventing misuse</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Data Sharing
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                ServeBasiq does not sell, rent, or trade your personal information.
                                Your data may only be shared when necessary to provide platform
                                functionality or when required by law.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Data Security
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                We take reasonable steps to protect your information from
                                unauthorized access, misuse, or disclosure. However,
                                no online platform can guarantee complete security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Third-Party Services
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                ServeBasiq may use third-party tools or services to support
                                platform functionality. These services operate under their
                                own privacy policies.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Your Rights
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                You have the right to request access, correction, or deletion
                                of your personal information by contacting us.
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
                            <p className="font-bold text-indigo-600">
                                servebasiq@gmail.com
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}