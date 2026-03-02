'use client';

import {
    TrendingUp, Briefcase, Bell, Star, PieChart,
    Clock, CheckCircle, XCircle, Calendar, Package, ChevronRight
} from 'lucide-react';
import { StatCard } from './DashboardComponents';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';

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

const revenueOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
        y: {
            grid: { color: 'rgba(148, 163, 184, 0.1)', drawTicks: false },
            ticks: {
                callback: (value: any) => '₹' + value + 'k',
                font: { weight: 'bold', size: 10 },
                color: '#94a3b8',
                padding: 10,
            },
        },
        x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 }, color: '#94a3b8', padding: 10 } },
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

export function DashboardHomeView({
    stats, setActiveView, recentBookings = [], recentOrders = [], providerType
}: any) {

    // Helper for Status Badges
    const getStatusBadge = (status: string) => {
        const s = status?.toUpperCase();
        if (['COMPLETED', 'DELIVERED'].includes(s)) {
            return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-700"><CheckCircle size={12} /> Completed</span>;
        }
        if (['CANCELLED', 'REJECTED'].includes(s)) {
            return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-red-100 text-red-700"><XCircle size={12} /> Cancelled</span>;
        }
        return <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700"><Clock size={12} /> Pending</span>;
    };

    const dashboardStats = stats?.stats || { revenue: 0, jobsCompleted: 0, pendingRequests: 0, rating: 5.0 };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* 1. Dynamic Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <StatCard icon={TrendingUp} label="Total Income" value={`₹${dashboardStats.revenue.toLocaleString('en-IN')}`} trend="12%" color="emerald" />
                <StatCard icon={Briefcase} label="Total Orders" value={dashboardStats.jobsCompleted} trend="5%" color="blue" />
                <StatCard icon={Bell} label="Pending Requests" value={dashboardStats.pendingRequests} color="orange" />
                <StatCard icon={Star} label="Avg. Rating" value={dashboardStats.rating.toFixed(1)} trend="2%" color="purple" />
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp size={20} className="text-[#0284c7]" /> Revenue Overview
                        </h3>
                        <select className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 text-slate-600 outline-none">
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="relative h-72 w-full"><Line data={revenueData} options={revenueOptions} /></div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-purple-600" /> Traffic Sources
                    </h3>
                    <div className="relative h-64 w-full flex justify-center items-center">
                        <Doughnut data={trafficData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* 3. Activity Section */}
            {/* 3. Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* RECENT BOOKINGS (Services) */}
                {(providerType === 'SERVICE' || providerType === 'BOTH') && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Calendar size={18} /></div>
                                <h3 className="font-bold text-slate-900">Recent Bookings</h3>
                            </div>
                            <button onClick={() => setActiveView('requests')} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center transition-colors">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="flex-1">
                            {recentBookings.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 text-sm font-medium">No recent bookings.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {recentBookings.map((booking: any) => (
                                        <div key={booking.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {/* 👉 Show Service Image */}
                                                <img
                                                    src={booking.service?.serviceimg || '/placeholder-service.png'}
                                                    className="h-10 w-10 rounded-lg object-cover border border-slate-100"
                                                    alt="service"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm text-slate-900 truncate max-w-[150px]">
                                                        {booking.service?.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-medium truncate">{booking.user?.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                {/* 👉 Handle "QUOTE" or 0 Price logic */}
                                                <p className="font-bold text-sm text-slate-900">
                                                    {booking.service?.priceType === 'QUOTE' || booking.service?.price === 0
                                                        ? "Quote"
                                                        : `₹${booking.service?.price}`}
                                                </p>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">
                                                        {booking.service?.priceType}
                                                    </span>
                                                    {getStatusBadge(booking.status)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* RECENT ORDERS (Products) */}
                {(providerType === 'PRODUCT' || providerType === 'BOTH') && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Package size={18} /></div>
                                <h3 className="font-bold text-slate-900">Recent Orders</h3>
                            </div>
                            <button onClick={() => setActiveView('requests')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center transition-colors">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="flex-1">
                            {recentOrders.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 text-sm font-medium">No recent orders.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {recentOrders.map((order: any) => (
                                        <div key={order.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {/* 👉 Show Product Image */}
                                                <img
                                                    src={order.product?.productImage || '/placeholder-product.png'}
                                                    className="h-10 w-10 rounded-lg object-cover border border-slate-100"
                                                    alt="product"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm text-slate-900 truncate max-w-[150px]">
                                                        {order.product?.name}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-medium truncate">
                                                        Qty: {order.quantity} {order.product?.unit} • {order.user?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-bold text-sm text-slate-900">₹{order.totalPrice}</p>
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
    );
}