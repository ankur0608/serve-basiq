'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { faqs } from './faqData';

export default function FAQContent() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <main>
                {/* HERO */}
                <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
                        <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/20 text-sm font-semibold tracking-wide">
                            Support
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
                            Everything you need to know about discovering nearby services, products, and rentals on ServeBasiq.
                        </p>
                    </div>
                </section>

                {/* CONTENT */}
                <div className="max-w-3xl mx-auto px-4 py-20">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={index}
                                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                                >
                                    <h3>
                                        <button
                                            onClick={() => toggleFAQ(index)}
                                            aria-expanded={isOpen}
                                            aria-controls={`faq-answer-${index}`}
                                            className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
                                        >
                                            <span className="font-semibold text-slate-900 text-base sm:text-lg pr-4">
                                                {faq.question}
                                            </span>
                                            <ChevronDown
                                                className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
                                                size={20}
                                            />
                                        </button>
                                    </h3>

                                    <div
                                        id={`faq-answer-${index}`}
                                        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                    >
                                        <div className="min-h-0">
                                            <p className="px-6 pb-5 text-slate-600 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CONTACT BOX */}
                    <section className="mt-16 bg-slate-100 rounded-3xl p-10 text-center border border-slate-200">
                        <h2 className="text-2xl font-bold mb-3 text-slate-900">
                            Still have questions?
                        </h2>
                        <p className="text-slate-600 mb-6 max-w-lg mx-auto leading-relaxed">
                            Can't find the answer you're looking for? Reach out to our friendly support team.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition"
                        >
                            Contact Support
                        </Link>
                    </section>

                    {/* CROSS-LINKS FOOTER */}
                    <section className="text-center pt-12 mt-12 border-t border-slate-200">
                        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                            <Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
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