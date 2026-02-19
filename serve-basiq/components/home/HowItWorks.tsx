'use client';

import { useState } from 'react';
import { Search, Users, ShieldCheck, ArrowRight } from 'lucide-react';
// 👉 NOTE: Adjust this import path to wherever your LoginModal is actually saved!
import LoginModal from '@/components/auth/LoginModal';

export default function HowItWorks() {
    // State to control the login modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const steps = [
        {
            id: 1,
            title: "Search or Post",
            desc: "Find services, wholesale suppliers or rental providers instantly.",
            icon: <Search className="w-7 h-7" />,
            colorClass: "text-blue-600 bg-blue-50 border-blue-100",
            badgeClass: "bg-blue-600 text-white"
        },
        {
            id: 2,
            title: "Compare & Connect",
            desc: "View ratings, pricing and connect directly without middlemen.",
            icon: <Users className="w-7 h-7" />,
            colorClass: "text-purple-600 bg-purple-50 border-purple-100",
            badgeClass: "bg-purple-600 text-white"
        },
        {
            id: 3,
            title: "Book Securely",
            desc: "Safe payments and guaranteed service delivery every time.",
            icon: <ShieldCheck className="w-7 h-7" />,
            colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
            badgeClass: "bg-emerald-600 text-white"
        }
    ];

    return (
        <section className="bg-white pt-20 pb-12 relative overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- TOP: HOW IT WORKS --- */}
                <div className="text-center mb-16 md:mb-24">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        How <span className="text-blue-600">ServeBasiq</span> Works
                    </h2>
                    <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-sm md:text-base">
                        Your all-in-one marketplace for services, wholesale, and rentals. Simple, direct, and secure.
                    </p>
                </div>

                <div className="relative mb-24">
                    {/* Desktop Dashed Connector Line */}
                    <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-slate-200 z-0"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
                        {steps.map((step) => (
                            <div key={step.id} className="flex flex-col items-center text-center group">
                                {/* Icon Container with Overlapping Step Number */}
                                <div className="relative mb-6">
                                    <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:-translate-y-2 ${step.colorClass}`}>
                                        {step.icon}
                                    </div>
                                    <span className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-xs font-bold shadow-sm ${step.badgeClass}`}>
                                        {step.id}
                                    </span>
                                </div>

                                {/* Text Content */}
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-[260px]">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- BOTTOM: CTA BANNER --- */}
                <div className="bg-slate-900 rounded-[2rem] p-8 md:p-14 text-center relative overflow-hidden shadow-2xl mx-auto max-w-5xl">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
                        <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[150%] bg-blue-500/30 blur-[100px] rounded-full"></div>
                        <div className="absolute -bottom-[50%] -right-[10%] w-[50%] h-[150%] bg-purple-500/30 blur-[100px] rounded-full"></div>
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight">
                            Join India’s Growing Services & <br className="hidden md:block" /> Wholesale Marketplace
                        </h2>
                        <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-sm md:text-base">
                            Find trusted professionals, reliable suppliers and rental partners today. No middlemen, transparent pricing.
                        </p>

                        {/* Changed from <Link> to <button> to trigger modal */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 hover:scale-105 transition-all shadow-lg active:scale-95"
                        >
                            Get Started for Free
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

            </div>

            {/* Render the LoginModal and pass the state controls */}
            <LoginModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </section>
    );
}