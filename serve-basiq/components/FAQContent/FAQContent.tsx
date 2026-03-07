// components/FAQContent.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        question: "What is ServeBasiq?",
        answer: "ServeBasiq is a platform that connects you with local service providers and product sellers in your area. We make it easy to discover, book, and buy from businesses nearby."
    },
    {
        question: "How do I book a service?",
        answer: "Simply search for the service you need, review the provider's profile and pricing, and click the 'Book' or 'Request' button. You can manage all your requests from your dashboard."
    },
    {
        question: "Is ServeBasiq free to use?",
        answer: "Yes, creating an account and browsing services/products on ServeBasiq is completely free for customers. You only pay for the specific services or products you purchase."
    },
    {
        question: "How do I become a seller or service provider?",
        answer: "You can sign up as a provider by navigating to your account settings and selecting 'Become a Provider'. You'll need to fill out some details about your business to get listed."
    },
    {
        question: "What happens if I need to cancel a booking?",
        answer: "You can cancel a booking from your Requests dashboard. Please note that cancellation policies may vary depending on the individual service provider."
    }
];

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
                        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/20 text-sm font-medium">
                            Support
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto">
                            Find answers to common questions about using ServeBasiq.
                        </p>
                    </div>
                </section>

                {/* CONTENT */}
                <div className="max-w-3xl mx-auto px-4 py-20">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                                >
                                    <span className="font-semibold text-slate-900 text-lg">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                                        size={20}
                                    />
                                </button>

                                <div
                                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <p className="text-slate-600 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CONTACT BOX */}
                    <section className="mt-16 bg-slate-100 rounded-3xl p-10 text-center border border-slate-200">
                        <h2 className="text-2xl font-bold mb-3 text-slate-900">
                            Still have questions?
                        </h2>
                        <p className="text-slate-600 mb-6 max-w-lg mx-auto leading-relaxed">
                            Can't find the answer you're looking for? Reach out to our friendly support team.
                        </p>
                        <a
                            href="/contact"
                            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition"
                        >
                            Contact Support
                        </a>
                    </section>
                </div>
            </main>
        </div>
    );
}