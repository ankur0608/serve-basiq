// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { services, products } from '@/lib/data';
// import ServiceCard from '@/components/ui/ServiceCard';
// import ProductCard from '@/components/ui/ProductCard';
// import {
//     FaUser, FaRightFromBracket, FaCalendarCheck,
//     FaFileInvoice, FaHeart, FaGear, FaPhone, FaWallet
// } from 'react-icons/fa6';
// import clsx from 'clsx';

// export default function ProfilePage() {
//     const [activeTab, setActiveTab] = useState<'dashboard' | 'saved' | 'settings'>('dashboard');

//     // --- MOCK DATA ---
//     const user = {
//         name: "Rajesh Kumar",
//         phone: "+91 98765 43210",
//         initials: "RK",
//         memberSince: "Jan 2025"
//     };

//     const stats = [
//         { label: "Total Bookings", value: "12", icon: FaCalendarCheck, color: "text-blue-600", bg: "bg-blue-50" },
//         { label: "Total Spend", value: "₹45k", icon: FaWallet, color: "text-green-600", bg: "bg-green-50" },
//         { label: "Pending Quotes", value: "3", icon: FaFileInvoice, color: "text-orange-600", bg: "bg-orange-50" },
//     ];

//     const bookings = [
//         { id: 1, provider: "Elite Cleaners", service: "Home Cleaning", price: "₹1,200", status: "Completed", date: "Yesterday", type: 'service' },
//         { id: 2, provider: "Mike's Plumbing", service: "Pipe Repair", price: "₹450", status: "Confirmed", date: "Tomorrow, 10:00 AM", type: 'service' }
//     ];

//     const quotes = [
//         { id: 101, product: "CNC Lathe Machine", supplier: "Global Machineries", status: "Pending", date: "2 days ago" },
//     ];

//     // Simulating saved items
//     const savedServices = services.slice(0, 2);
//     const savedProducts = products.slice(1, 2);

//     return (
//         <div className="min-h-screen pb-32">

//             {/* ================= HEADER SECTION ================= */}
//             <div className="bg-slate-900 text-white pt-12 pb-24 px-4 relative overflow-hidden">
//                 {/* Background Pattern */}
//                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

//                 <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
//                     {/* Avatar */}
//                     <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl border-4 border-slate-800">
//                         {user.initials}
//                     </div>

//                     {/* User Info */}
//                     <div className="flex-1 mb-2">
//                         <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
//                         <div className="flex items-center justify-center md:justify-start gap-4 text-slate-400 text-sm font-medium">
//                             <span className="flex items-center gap-1.5"><FaPhone className="text-xs" /> {user.phone}</span>
//                             <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
//                             <span>Member since {user.memberSince}</span>
//                         </div>
//                     </div>

//                     {/* Logout Button */}
//                     <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-bold transition-all backdrop-blur-sm mb-2">
//                         <FaRightFromBracket /> Logout
//                     </button>
//                 </div>
//             </div>

//             <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20">

//                 {/* ================= STATS CARDS ================= */}
//                 <div className="grid grid-cols-3 gap-4 mb-8">
//                     {stats.map((stat, i) => (
//                         <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition duration-300">
//                             <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center mb-2 text-lg", stat.bg, stat.color)}>
//                                 <stat.icon />
//                             </div>
//                             <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
//                             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{stat.label}</div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* ================= TABS ================= */}
//                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 flex overflow-x-auto no-scrollbar">
//                     <button
//                         onClick={() => setActiveTab('dashboard')}
//                         className={clsx(
//                             "flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap px-4",
//                             activeTab === 'dashboard' ? "bg-slate-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
//                         )}
//                     >
//                         <FaUser /> Dashboard
//                     </button>
//                     <button
//                         onClick={() => setActiveTab('saved')}
//                         className={clsx(
//                             "flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap px-4",
//                             activeTab === 'saved' ? "bg-red-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
//                         )}
//                     >
//                         <FaHeart /> Favourites
//                     </button>
//                     <button
//                         onClick={() => setActiveTab('settings')}
//                         className={clsx(
//                             "flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap px-4",
//                             activeTab === 'settings' ? "bg-slate-200 text-slate-900" : "text-gray-500 hover:bg-gray-50"
//                         )}
//                     >
//                         <FaGear /> Settings
//                     </button>
//                 </div>

//                 {/* ================= CONTENT: DASHBOARD ================= */}
//                 {activeTab === 'dashboard' && (
//                     <div className="space-y-8 animate-fade-in">

//                         {/* Bookings */}
//                         <div>
//                             <div className="flex justify-between items-end mb-4">
//                                 <h3 className="font-bold text-lg text-slate-900">Recent Bookings</h3>
//                                 <Link href="/bookings" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
//                             </div>
//                             <div className="space-y-3">
//                                 {bookings.map((b) => (
//                                     <div key={b.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition group cursor-pointer">
//                                         <div className="flex items-center gap-4">
//                                             <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition">
//                                                 <FaCalendarCheck />
//                                             </div>
//                                             <div>
//                                                 <div className="font-bold text-slate-900">{b.provider}</div>
//                                                 <div className="text-xs text-gray-500">{b.service} • {b.date}</div>
//                                             </div>
//                                         </div>
//                                         <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-none pt-3 sm:pt-0">
//                                             <div className="font-bold text-slate-900">{b.price}</div>
//                                             <div className={clsx(
//                                                 "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
//                                                 b.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
//                                             )}>
//                                                 {b.status}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* B2B Quotes */}
//                         <div>
//                             <h3 className="font-bold text-lg mb-4 text-slate-900">Quote Requests</h3>
//                             <div className="space-y-3">
//                                 {quotes.map((q) => (
//                                     <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition">
//                                         <div className="flex items-center gap-4">
//                                             <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl">
//                                                 <FaFileInvoice />
//                                             </div>
//                                             <div>
//                                                 <div className="font-bold text-slate-900">{q.product}</div>
//                                                 <div className="text-xs text-gray-500">{q.supplier}</div>
//                                             </div>
//                                         </div>
//                                         <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-none pt-3 sm:pt-0">
//                                             <div className="text-xs text-gray-400">Sent {q.date}</div>
//                                             <div className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 uppercase tracking-wide">
//                                                 {q.status}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                     </div>
//                 )}

//                 {/* ================= CONTENT: SAVED ================= */}
//                 {activeTab === 'saved' && (
//                     <div className="animate-fade-in">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             {savedServices.map(service => (
//                                 <ServiceCard key={service.id} service={service} />
//                             ))}
//                             {savedProducts.map(product => (
//                                 <div key={product.id} className="h-full">
//                                     <ProductCard product={product} />
//                                 </div>
//                             ))}
//                         </div>

//                         {savedServices.length === 0 && savedProducts.length === 0 && (
//                             <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
//                                 <div className="text-gray-300 text-4xl mb-4"><FaHeart /></div>
//                                 <p className="text-gray-500 font-medium">No saved items yet.</p>
//                                 <Link href="/services" className="text-blue-600 font-bold text-sm hover:underline mt-2 inline-block">Explore Services</Link>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* ================= CONTENT: SETTINGS ================= */}
//                 {activeTab === 'settings' && (
//                     <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-fade-in">
//                         <h3 className="font-bold text-lg mb-6">Account Settings</h3>
//                         <div className="space-y-6">
//                             <div className="flex items-center justify-between py-2">
//                                 <div>
//                                     <div className="font-bold text-sm text-slate-900">Notifications</div>
//                                     <div className="text-xs text-gray-500">Receive updates on bookings</div>
//                                 </div>
//                                 <div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
//                             </div>
//                             <hr className="border-gray-100" />
//                             <div className="flex items-center justify-between py-2">
//                                 <div>
//                                     <div className="font-bold text-sm text-slate-900">Dark Mode</div>
//                                     <div className="text-xs text-gray-500">Switch app appearance</div>
//                                 </div>
//                                 <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
//                             </div>
//                             <hr className="border-gray-100" />
//                             <button className="text-red-500 font-bold text-sm flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg -ml-4 transition w-full">
//                                 <FaRightFromBracket /> Delete Account
//                             </button>
//                         </div>
//                     </div>
//                 )}

//             </div>
//         </div>
//     );
// }