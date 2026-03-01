'use client';

import {
    TrendingUp, Briefcase, Bell, Star, PieChart,
    Wallet, Clock, CreditCard, QrCode, Check, Pencil, MapPin, User, FileText, Landmark,
    Loader2,
    CalendarClock,
    // 👉 New icons for recent activity
    Calendar, Package, ChevronRight, CheckCircle, XCircle
} from 'lucide-react';
import { StatCard, RequestCard, LeadCard } from './DashboardComponents';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { useState } from 'react';
import {
    Hexagon,
    Settings, LogOut, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
        label: 'Earnings',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: '#0284c7',
        backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
            gradient.addColorStop(1, 'rgba(14, 165, 233, 0)');
            return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#0284c7',
        pointRadius: 4,
    }]
};

// Updated revenueOptions to satisfy Chart.js 4.x types
const revenueOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        },
    },
    scales: {
        y: {
            grid: {
                display: true,
                drawOnChartArea: true,
                drawTicks: false,
                color: 'rgba(148, 163, 184, 0.1)', // Subtle grid lines
            },
            border: {
                display: false,
                dash: [4, 4],
            },
            ticks: {
                callback: (value: any) => '₹' + value + 'k',
                font: {
                    weight: 'bold',
                    size: 10,
                },
                color: '#94a3b8',
                padding: 10,
            },
        },
        x: {
            grid: {
                display: false,
            },
            border: {
                display: false,
            },
            ticks: {
                font: {
                    weight: 'bold',
                    size: 10,
                },
                color: '#94a3b8',
                padding: 10,
            },
        },
    },
};

const trafficData = {
    labels: ['Direct', 'Social', 'Referral'],
    datasets: [{
        data: [55, 30, 15],
        backgroundColor: ['#0284c7', '#38bdf8', '#bae6fd'],
        borderWidth: 0,
    }]
};

// 👉 Updated props to receive the dynamic data
export function DashboardHomeView({
    stats, setActiveView, isVerified, recentBookings = [], recentOrders = [], providerType
}: any) {

    // 👉 Helper function for dynamic status badges
    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED': case 'DELIVERED':
                return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700"><CheckCircle size={12} /> Completed</span>;
            case 'CANCELLED': case 'REJECTED':
                return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-red-100 text-red-700"><XCircle size={12} /> Cancelled</span>;
            default:
                return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700"><Clock size={12} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <StatCard icon={TrendingUp} label="Total Income" value={`₹${(stats?.stats?.revenue || 0).toLocaleString()}`} trend="12%" color="emerald" />
                <StatCard icon={Briefcase} label="Total Orders" value={stats?.stats?.jobsCompleted || 0} trend="5%" color="blue" />
                <StatCard icon={Bell} label="Pending Requests" value={stats?.stats?.pendingRequests || 0} color="orange" />
                <StatCard icon={Star} label="Avg. Rating" value={(stats?.stats?.rating || 0).toFixed(1)} trend="2%" color="purple" />
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={20} className="text-[#0284c7]" /> Revenue Overview</h3>
                        <select className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-600"><option>This Year</option><option>Last Year</option></select>
                    </div>
                    <div className="relative h-72 w-full"><Line data={revenueData} options={revenueOptions} /></div>
                </div>
                <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><PieChart size={20} className="text-purple-600" /> Traffic Sources</h3>
                    <div className="relative h-64 w-full flex justify-center"><Doughnut data={trafficData} /></div>
                </div>
            </div>

            {/* 👉 3. RECENT ACTIVITY SECTION (Dynamic) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Bookings (Only show if provider is SERVICE or BOTH) */}
                {(providerType === 'SERVICE' || providerType === 'BOTH') && (
                    <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Calendar size={18} /></div>
                                <h3 className="font-bold text-slate-900">Recent Bookings</h3>
                            </div>
                            <button onClick={() => setActiveView('requests')} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center transition-colors">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="p-0 flex-1">
                            {recentBookings.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm font-medium">No recent bookings found.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {recentBookings.slice(0, 4).map((booking: any) => (
                                        <div key={booking.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between cursor-pointer" onClick={() => setActiveView('requests')}>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{booking.service?.title || 'Unknown Service'}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <p className="font-bold text-sm text-slate-900">₹{booking.price}</p>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Orders (Only show if provider is PRODUCT or BOTH) */}
                {(providerType === 'PRODUCT' || providerType === 'BOTH') && (
                    <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Package size={18} /></div>
                                <h3 className="font-bold text-slate-900">Recent Orders</h3>
                            </div>
                            <button onClick={() => setActiveView('requests')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center transition-colors">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="p-0 flex-1">
                            {recentOrders.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm font-medium">No recent orders found.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {recentOrders.slice(0, 4).map((order: any) => (
                                        <div key={order.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between cursor-pointer" onClick={() => setActiveView('requests')}>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{order.product?.name || 'Unknown Product'}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <p className="font-bold text-sm text-slate-900">₹{order.totalAmount}</p>
                                                {getStatusBadge(order.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export function EarningsView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 bg-[#0f172a] rounded-2xl shadow-xl shadow-slate-900/20 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet size={64} /></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Available Balance</p>
                    <h2 className="text-3xl font-bold tracking-tight">₹24,56,200</h2>
                    <div className="mt-5"><button className="w-full bg-white/10 hover:bg-white/20 text-sm font-bold py-2 rounded-lg transition-colors border border-white/10">Withdraw Funds</button></div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Clearance</p>
                    <h2 className="text-2xl font-bold text-slate-900">₹45,000</h2>
                    <div className="mt-2 text-xs text-amber-600 font-bold bg-amber-50 w-fit px-2 py-1 rounded border border-amber-100 flex gap-1 items-center"><Clock size={12} /> 3 Pending</div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Withdrawn</p>
                    <h2 className="text-2xl font-bold text-slate-900">₹12,00,000</h2>
                    <div className="mt-2 text-xs text-slate-400 font-medium">Last: ₹50k on Oct 20</div>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Next Payout</p>
                    <h2 className="text-2xl font-bold text-slate-900">Nov 01</h2>
                    <div className="mt-2 text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-1 rounded border border-emerald-100">Automated</div>
                </div>
            </div>

            {/* Transaction Table Mock */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 text-lg">Transaction History</h3>
                    <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition-colors">Export CSV</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="bg-slate-50/50 uppercase text-xs font-bold text-slate-500 border-b border-slate-100">
                            <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Description</th><th className="px-6 py-4">Source</th><th className="px-6 py-4 text-right">Amount</th><th className="px-6 py-4 text-center">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            <tr className="hover:bg-slate-50"><td className="px-6 py-4 font-medium text-slate-900">Oct 24, 2024</td><td className="px-6 py-4">Payment for Order #9981</td><td className="px-6 py-4"><span className="flex items-center gap-1"><CreditCard size={14} className="text-slate-400" /> Card</span></td><td className="px-6 py-4 text-right font-bold text-emerald-600">+₹12,500</td><td className="px-6 py-4 text-center"><span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">Completed</span></td></tr>
                            <tr className="hover:bg-slate-50"><td className="px-6 py-4 font-medium text-slate-900">Oct 23, 2024</td><td className="px-6 py-4">Service Fee - Plumbing</td><td className="px-6 py-4"><span className="flex items-center gap-1"><QrCode size={14} className="text-slate-400" /> UPI</span></td><td className="px-6 py-4 text-right font-bold text-emerald-600">+₹4,200</td><td className="px-6 py-4 text-center"><span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold">Pending</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}