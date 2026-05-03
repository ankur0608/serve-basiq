'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
    question: string;
    answer: string;
}

interface InlinePageFAQProps {
    faqs: FAQItem[];
    title?: string;
    linkToFullFaq?: boolean;
}

export default function InlinePageFAQ({ faqs, title = 'Frequently Asked Questions', linkToFullFaq = true }: InlinePageFAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="max-w-3xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">{title}</h2>
            <div className="space-y-3">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div
                            key={index}
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                            <h3>
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    aria-expanded={isOpen}
                                    aria-controls={`inline-faq-${index}`}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
                                >
                                    <span className="font-semibold text-slate-900 text-base pr-4">{faq.question}</span>
                                    <ChevronDown
                                        className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
                                        size={20}
                                    />
                                </button>
                            </h3>
                            <div
                                id={`inline-faq-${index}`}
                                className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                            >
                                <div className="min-h-0">
                                    <p className="px-6 pb-5 text-slate-600 leading-relaxed text-sm">{faq.answer}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {linkToFullFaq && (
                <p className="text-center mt-8 text-sm text-slate-500">
                    Have more questions?{' '}
                    <Link href="/faq" className="text-indigo-600 font-semibold hover:underline">
                        Visit our full FAQ page
                    </Link>
                </p>
            )}
        </section>
    );
}
