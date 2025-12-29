'use client';

import {
    DollarSign, Briefcase, Star, Bell, Wallet, Filter, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { StatCard, ActivityItem, RequestCard, LeadCard } from './DashboardComponents';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Chart Data Configuration
const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        label: 'Earnings',
        data: [150, 280, 220, 400, 350, 500, 450],
        borderColor: '#2563EB',
        backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
            gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
            return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#2563EB',
        pointRadius: 6,
    }]
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { grid: { borderDash: [4, 4], color: '#e2e8f0' }, ticks: { callback: (v: any) => '$' + v } },
        x: { grid: { display: false } }
    }
};

export function DashboardHomeView({ stats, setActiveView, onBackToHome }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                    <p className="text-slate-500 text-sm mt-1">Welcome back, {stats?.service?.name || "Provider"}!</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onBackToHome}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
                    >
                        <ArrowLeft size={14} /> Back to Website
                    </button>

                    <span className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-xs font-bold shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats?.stats.revenue}`} trend="+12%" color="blue" />
                <StatCard icon={Briefcase} label="Jobs Completed" value={stats?.stats.jobsCompleted} color="purple" />
                <StatCard icon={Star} label="Average Rating" value={stats?.stats.rating} color="orange" />
                <div onClick={() => setActiveView('requests')} className="cursor-pointer bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition">
                    <div className="flex justify-between mb-4">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Bell size={20} /></div>
                        <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">Action Needed</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{stats?.stats.pendingRequests}</h3>
                    <p className="text-slate-400 text-xs font-medium">Pending Requests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-6">Revenue Analytics</h3>
                    <div className="h-64">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="space-y-6 relative border-l border-slate-200 ml-2">
                        <ActivityItem type="job" title="Pipe fixing at Block A" time="2 mins ago" />
                        <ActivityItem type="request" title="Kitchen sink installation" time="1 hour ago" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function RequestsView({ showToast }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Requests</h2>
            <div className="space-y-4">
                <RequestCard
                    id="req-1"
                    title="Kitchen Tap Replacement"
                    customer="John Doe"
                    location="Downtown"
                    price="65.00"
                    urgent={true}
                    onAccept={() => showToast('Booking Accepted', 'success')}
                    onReject={() => showToast('Booking Rejected', 'error')}
                />
                <RequestCard
                    id="req-2"
                    title="Bathroom Inspection"
                    customer="Sarah Smith"
                    location="Westside"
                    price="30.00"
                    urgent={false}
                    color="purple"
                    onAccept={() => showToast('Booking Accepted', 'success')}
                    onReject={() => showToast('Booking Rejected', 'error')}
                />
            </div>
        </div>
    )
}

export function LeadsView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Open Leads</h2>
                <button className="bg-white p-2 rounded border hover:bg-slate-50"><Filter size={20} className="text-slate-600" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <LeadCard title="Sink Installation" dist="4.5 km" time="20 mins ago" category="Plumbing" />
                <LeadCard title="Garden Hose Repair" dist="1.2 km" time="1 hour ago" category="Repair" color="orange" />
                <LeadCard title="Full House Check" dist="8.0 km" time="3 hours ago" category="Maintenance" color="blue" />
            </div>
        </div>
    )
}

export function EarningsView() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Earnings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
                    <Wallet className="absolute top-0 right-0 m-8 w-32 h-32 opacity-10" />
                    <p className="text-slate-400 font-medium mb-1">Available Balance</p>
                    <h1 className="text-5xl font-bold mb-6">$450.00</h1>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition">
                        Withdraw Funds
                    </button>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 mb-4">Summary</h3>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-slate-500 text-sm">Today</span><span className="font-bold">$120.00</span></div>
                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-slate-500 text-sm">Pending</span><span className="font-bold text-yellow-600">$85.00</span></div>
                </div>
            </div>
        </div>
    )
}

// ✅ UPDATED PROFILE VIEW TO USE USER IMAGE
export function ProfileView({ stats, onEdit }: any) {
    // This will now correctly be the User Image if you applied the ProviderDashboard fix
    const imageUrl = stats?.service?.img || "https://i.pravatar.cc/150";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                {/* Banner Background */}
                <div className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-600 relative"></div>

                <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end -mt-12 mb-4">
                        {/* Profile Image */}
                        <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white overflow-hidden">
                            <img
                                src={imageUrl}
                                alt={stats?.service?.name || "Profile"}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = "https://i.pravatar.cc/150"; }}
                            />
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={onEdit}
                            className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-black transition shadow-md"
                        >
                            Edit Profile & Verification
                        </button>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        {stats?.service?.name || "Provider Name"} <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-100" />
                    </h1>
                    <p className="text-slate-500">{stats?.service?.cat || "Service"} Expert</p>

                    <div className="mt-6">
                        <h3 className="font-bold mb-2">About</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{stats?.service?.desc || "No description provided."}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}