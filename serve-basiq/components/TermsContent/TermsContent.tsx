// components/TermsContent.tsx
import React from 'react';

export default function TermsContent() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <main>
                {/* HERO */}
                <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
                        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/20 text-sm font-medium">
                            Legal
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                            Terms of Use
                        </h1>
                        <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto">
                            These terms govern your access to and use of the ServeBasiq platform.
                            By using our website, you agree to these terms.
                        </p>
                    </div>
                </section>

                {/* CONTENT */}
                <div className="max-w-4xl mx-auto px-4 py-20 space-y-16">
                    {/* INTRO */}
                    <section className="text-center">
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Welcome to ServeBasiq. These Terms & Conditions outline the rules and
                            responsibilities for using our platform. Please read them carefully.
                        </p>
                    </section>

                    {/* POLICY SECTIONS */}
                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Platform Overview
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                ServeBasiq is a discovery platform that connects users with
                                nearby service providers and product sellers. We do not directly
                                provide services or sell products ourselves.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                User Responsibilities
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                By using ServeBasiq, you agree to:
                            </p>
                            <ul className="list-disc pl-6 text-slate-600 space-y-3">
                                <li>Provide accurate and truthful information</li>
                                <li>Use the platform only for lawful purposes</li>
                                <li>Verify service providers or sellers before engaging with them</li>
                                <li>Respect other users, providers, and sellers</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Service Providers & Sellers
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Service providers and product sellers listed on ServeBasiq are
                                independent entities. ServeBasiq does not guarantee the quality,
                                pricing, or delivery of services or products offered by them.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Limitation of Liability
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                ServeBasiq is not responsible for disputes, losses, or damages
                                arising from interactions between users and service providers
                                or sellers. Any engagement is at your own discretion.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Content & Intellectual Property
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                All content on ServeBasiq, including text, design, and branding,
                                is owned by ServeBasiq unless otherwise stated. Unauthorized use
                                of content is not permitted.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Account Termination
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                We reserve the right to suspend or terminate access to the platform
                                if users violate these terms or misuse the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-slate-900 border-l-4 border-indigo-500 pl-4">
                                Changes to These Terms
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                ServeBasiq may update these Terms & Conditions from time to time.
                                Continued use of the platform indicates acceptance of the updated terms.
                            </p>
                        </section>
                    </div>

                    {/* CONTACT BOX */}
                    <section className="bg-slate-100 rounded-3xl p-10 text-center border border-slate-200">
                        <h2 className="text-2xl font-bold mb-3 text-slate-900">
                            Questions?
                        </h2>
                        <p className="text-slate-600 mb-6 max-w-lg mx-auto leading-relaxed">
                            If you have any questions or concerns about these Terms & Conditions,
                            feel free to reach out to our team.
                        </p>
                        <div className="inline-block bg-white px-8 py-3 rounded-2xl shadow-sm border border-slate-200">
                            <p className="font-bold text-indigo-600">
                                info@servebasiq.com
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}