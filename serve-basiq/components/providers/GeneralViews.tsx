'use client';

import { useMemo } from 'react';
import {
    TrendingUp, Briefcase, Bell, Star, PieChart,
    Clock, CheckCircle, XCircle, Calendar, Package, ChevronRight, Key
} from 'lucide-react';
import { StatCard } from './DashboardComponents';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import clsx from 'clsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

// (Keep revenueData, revenueOptions, and trafficData as they were in your original code)
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
    stats, setActiveView, recentBookings = [], recentOrders = [], recentRentals = [], providerType
}: any) {

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

    // ✅ Combine Services and Rentals into one chronologically sorted timeline
    const combinedActivity = useMemo(() => {
        const services = recentBookings.map((b: any) => ({
            id: `srv_${b.id}`,
            type: 'SERVICE',
            title: b.service?.name,
            customerName: b.user?.name,
            image: b.service?.serviceimg || '/placeholder-service.png',
            priceLabel: b.service?.priceType === 'QUOTE' || b.service?.price === 0 ? 'Quote' : `₹${b.service?.price}`,
            badgeLabel: b.service?.priceType || 'FIXED',
            status: b.status,
            createdAt: b.createdAt
        }));

        const rentals = recentRentals.map((r: any) => ({
            id: `rnt_${r.id}`,
            type: 'RENTAL',
            title: r.rental?.name,
            customerName: r.user?.name,
            image: r.rental?.rentalImg || '/placeholder-rental.png', // ✅ Updated to rentalImg
            priceLabel: `₹${r.rental?.price || r.totalPrice || 0}`,
            badgeLabel: 'RENTAL',
            status: r.status,
            createdAt: r.createdAt
        }));

        // Merge and sort by newest first, then keep top 5
        return [...services, ...rentals]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

    }, [recentBookings, recentRentals]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <StatCard icon={TrendingUp} label="Total Income" value={`₹${dashboardStats.revenue.toLocaleString('en-IN')}`} trend="12%" color="emerald" />
                <StatCard icon={Briefcase} label="Total Orders" value={dashboardStats.jobsCompleted} trend="5%" color="blue" />
                <StatCard icon={Bell} label="Pending Requests" value={dashboardStats.pendingRequests} color="orange" />
                <StatCard icon={Star} label="Avg. Rating" value={dashboardStats.rating.toFixed(1)} trend="2%" color="purple" />
            </div>

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ✅ RECENT BOOKINGS & RENTALS */}
                {['SERVICE', 'RENTAL', 'BOTH'].includes(providerType) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Calendar size={18} />
                                </div>
                                <h3 className="font-bold text-slate-900">Recent Bookings</h3>
                            </div>
                            <button onClick={() => setActiveView('requests')} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center transition-colors">
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="flex-1">
                            {combinedActivity.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 text-sm font-medium">No recent activity.</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {combinedActivity.map((item: any) => (
                                        <div key={item.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img
                                                        src={item.image}
                                                        className="h-10 w-10 rounded-lg object-cover border border-slate-100"
                                                        alt={item.title}
                                                    />
                                                    {/* Little indicator icon for Rentals vs Services */}
                                                    <div className={clsx(
                                                        "absolute -bottom-1 -right-1 p-0.5 rounded-full border-2 border-white",
                                                        item.type === 'RENTAL' ? "bg-purple-500 text-white" : "bg-blue-500 text-white"
                                                    )}>
                                                        {item.type === 'RENTAL' ? <Key size={8} /> : <Briefcase size={8} />}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm text-slate-900 truncate max-w-[150px]">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-medium truncate">{item.customerName}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-bold text-sm text-slate-900">{item.priceLabel}</p>
                                                <div className="flex flex-col items-end gap-1 mt-0.5">
                                                    <span className={clsx(
                                                        "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded",
                                                        item.type === 'RENTAL' ? "bg-purple-100 text-purple-700" : "text-slate-400"
                                                    )}>
                                                        {item.badgeLabel}
                                                    </span>
                                                    {getStatusBadge(item.status)}
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
                {['PRODUCT', 'BOTH'].includes(providerType) && (
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