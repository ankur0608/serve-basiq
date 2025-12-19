'use client';

import { useState } from 'react';
import Link from 'next/link';
import { services, products } from '@/lib/data';
import ServiceCard from '@/components/ui/ServiceCard';
import ProductCard from '@/components/ui/ProductCard';
import { 
  FaUser, FaRightFromBracket, FaCalendarCheck, 
  FaFileInvoice, FaHeart, FaGear 
} from 'react-icons/fa6';
import clsx from 'clsx';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'saved'>('dashboard');

  // --- MOCK DATA FOR PROFILE ---
  // In a real app, this would come from your backend API
  const bookings = [
    { id: 1, provider: "Elite Cleaners", price: 300, status: "Completed", date: "Last Week", type: 'service' },
    { id: 2, provider: "Mike's Plumbing", price: 450, status: "Confirmed", date: "Tomorrow, 10:00 AM", type: 'service' }
  ];

  const quotes = [
    { id: 101, product: "CNC Lathe Machine", status: "Pending", date: "Yesterday", type: 'product' },
    { id: 102, product: "Safety Helmets (50 qty)", status: "Approved", date: "2 days ago", type: 'product' }
  ];

  // Simulating saved items by picking specific IDs from our global data
  const savedServices = services.slice(0, 2); // Taking first 2 for demo
  const savedProducts = products.slice(1, 2); // Taking 1 for demo

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center text-2xl font-bold text-brand-700 shadow-inner">
          JD
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">John Doe</h1>
          <p className="text-sm text-gray-500">Customer Account</p>
        </div>
        <button className="ml-auto text-red-500 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 flex items-center gap-2 transition">
          <FaRightFromBracket /> Logout
        </button>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={clsx(
            "pb-3 font-bold text-sm whitespace-nowrap transition border-b-2 flex items-center gap-2",
            activeTab === 'dashboard' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-400 hover:text-slate-600"
          )}
        >
          <FaUser /> Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={clsx(
            "pb-3 font-bold text-sm whitespace-nowrap transition border-b-2 flex items-center gap-2",
            activeTab === 'saved' ? "border-brand-600 text-brand-600" : "border-transparent text-gray-400 hover:text-slate-600"
          )}
        >
          <FaHeart className={activeTab === 'saved' ? "text-red-500" : ""} /> Favourites
        </button>
        <button className="pb-3 font-bold text-sm whitespace-nowrap transition border-b-2 border-transparent text-gray-400 hover:text-slate-600 flex items-center gap-2">
          <FaGear /> Settings
        </button>
      </div>

      {/* ================= CONTENT: DASHBOARD ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Section: Active Bookings */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-slate-900">Recent Bookings</h3>
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl">
                      <FaCalendarCheck />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{b.provider}</div>
                      <div className="text-xs text-gray-500">{b.date} • ₹{b.price}</div>
                    </div>
                  </div>
                  <div className={clsx(
                    "text-xs font-bold px-2.5 py-1 rounded-md",
                    b.status === 'Completed' ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                  )}>
                    {b.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: B2B Quotes */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-slate-900">Quote Requests (B2B)</h3>
            <div className="space-y-4">
              {quotes.map((q) => (
                <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-commerce-50 text-commerce-600 flex items-center justify-center text-xl">
                      <FaFileInvoice />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{q.product}</div>
                      <div className="text-xs text-gray-500">Sent {q.date}</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
                    {q.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= CONTENT: SAVED ================= */}
      {activeTab === 'saved' && (
        <div className="animate-fade-in">
          <h3 className="font-bold text-lg mb-4 text-slate-900">Your Favourites</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Render Saved Services */}
            {savedServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}

            {/* Render Saved Products (using a wrapper to make height match) */}
            {savedProducts.map(product => (
              <div key={product.id} className="h-full">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {savedServices.length === 0 && savedProducts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No saved items yet.
            </div>
          )}
        </div>
      )}

    </div>
  );
}