'use client';

import {
    TrendingUp, Briefcase, Bell, Star, PieChart,
    Wallet, Clock, CreditCard, QrCode, Check, Pencil, MapPin, User, FileText, Landmark,
    Loader2,
    CalendarClock
} from 'lucide-react';
import { StatCard, RequestCard, LeadCard } from './DashboardComponents';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

// --- CHARTS CONFIG (Same as before) ---
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

const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: {
            grid: { borderDash: [4, 4], drawBorder: false },
            ticks: { callback: (v: any) => '₹' + v + 'k', font: { weight: 'bold', size: 10 }, color: '#94a3b8' }
        },
        x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 10 }, color: '#94a3b8' } }
    }
};

const trafficData = {
    labels: ['Direct', 'Social', 'Referral'],
    datasets: [{
        data: [55, 30, 15],
        backgroundColor: ['#0284c7', '#38bdf8', '#bae6fd'],
        borderWidth: 0,
    }]
};

// --- VIEWS ---

export function DashboardHomeView({ stats, setActiveView }: any) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <StatCard icon={TrendingUp} label="Total Income" value={`₹${stats?.stats.revenue.toLocaleString()}`} trend="12%" color="emerald" />
                <StatCard icon={Briefcase} label="Total Orders" value={stats?.stats.jobsCompleted} trend="5%" color="blue" />
                <StatCard icon={Bell} label="Pending Requests" value={stats?.stats.pendingRequests} color="orange" />
                <StatCard icon={Star} label="Avg. Rating" value={stats?.stats.rating} trend="2%" color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={20} className="text-[#0284c7]" /> Revenue Overview</h3>
                        <select className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-2 py-1 outline-none text-slate-600"><option>This Year</option><option>Last Year</option></select>
                    </div>
                    <div className="relative h-72 w-full"><Line data={revenueData} /></div>
                </div>
                <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><PieChart size={20} className="text-purple-600" /> Traffic Sources</h3>
                    <div className="relative h-64 w-full flex justify-center"><Doughnut data={trafficData} /></div>
                </div>
            </div>
        </div>
    )
}


// export function LeadsView() {
//     return (
//         <div className="bg-white rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
//             <div className="px-6 py-5 border-b border-slate-100 bg-white flex justify-between items-center"><h3 className="font-bold text-slate-900 text-lg">Active Leads</h3></div>
//             <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white">
//                 <LeadCard title="Modular Kitchen" dist="4.5 km" time="20 mins ago" category="Furniture" color="blue" />
//                 <LeadCard title="Office Chair" dist="1.2 km" time="1 hour ago" category="Office" color="orange" />
//                 <LeadCard title="Full Home Interior" dist="8.0 km" time="3 hours ago" category="Interior" color="emerald" />
//             </div>
//         </div>
//     )
// }

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

// ✅ UPDATED ProfileView to use 'kycDetails' Relation
export function ProfileView({ stats, user, onEdit }: any) {
    // Fallback to default avatar if user.img is missing
    const imageUrl = user?.profileImage || user?.img || "https://i.pravatar.cc/150";

    // Find addresses safely
    const homeAddress = user?.addresses?.find((a: any) => a.type === 'Home');
    const workAddress = user?.addresses?.find((a: any) => a.type === 'Work') || homeAddress;

    // ✅ EXTRACT KYC DETAILS (New Schema)
    const kyc = user?.kycDetails || {};

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 text-center relative overflow-hidden group max-w-4xl mx-auto">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10"></div>
                <div className="relative inline-block cursor-pointer" onClick={onEdit}>
                    <img src={imageUrl} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl transition-transform group-hover:scale-105 bg-white" onError={(e) => e.currentTarget.src = "https://i.pravatar.cc/150"} alt="Profile" />
                    <div className="absolute bottom-2 right-2 bg-[#0f172a] text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-blue-600 transition-colors">
                        <Pencil size={16} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-4">{user?.name || "Provider Name"}</h2>
                <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Service Provider'} • {user?.isVerified ? 'Verified' : 'Pending Verification'}
                </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Personal Details */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 p-6 relative overflow-hidden">
                    <User className="absolute top-4 right-4 text-blue-100 -rotate-12" size={48} />
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2"><User size={14} /> Personal Details</h3>
                    <div className="space-y-3 text-sm">
                        <p className="text-slate-600 flex justify-between"><strong>Full Name:</strong> <span className="text-slate-900">{user?.name || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Email:</strong> <span className="text-slate-900">{user?.email || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Phone:</strong> <span className="text-slate-900">{user?.phone || "N/A"}</span></p>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-orange-500 p-6 relative overflow-hidden">
                    <MapPin className="absolute top-4 right-4 text-orange-100 -rotate-12" size={48} />
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2"><MapPin size={14} /> Location</h3>
                    <div className="space-y-3 text-sm">
                        <p className="text-slate-600 flex justify-between"><strong>Shop/Biz Name:</strong> <span className="text-slate-900">{stats?.service?.shopName || user?.shopName || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>City:</strong> <span className="text-slate-900">{workAddress?.city || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Address:</strong> <span className="text-slate-900 truncate max-w-[200px]">{workAddress?.line1 || "N/A"}</span></p>
                    </div>
                </div>

                {/* Banking */}
                {/* <div className="bg-white rounded-2xl shadow-sm border-l-4 border-emerald-500 p-6 relative overflow-hidden"> */}
                    {/* <Landmark className="absolute top-4 right-4 text-emerald-100 -rotate-12" size={48} /> */}
                    {/* <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2"><Landmark size={14} /> Banking</h3>
                    <div className="space-y-3 text-sm">
                        <p className="text-slate-600 flex justify-between"><strong>Bank Name:</strong> <span className="text-slate-900">{user?.bankName || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>Account No:</strong> <span className="text-slate-900 font-mono">•••• {user?.bankAccountNumber ? user.bankAccountNumber.slice(-4) : "0000"}</span></p>
                        <p className="text-slate-600 flex justify-between"><strong>IFSC:</strong> <span className="text-slate-900 font-mono">{user?.bankIfsc || "N/A"}</span></p> */}
                    {/* </div> */}
                {/* </div> */}

                {/* KYC - ✅ UPDATED TO USE kycDetails */}
                <div className="bg-white rounded-2xl shadow-sm border-l-4 border-purple-500 p-6 relative overflow-hidden">
                    <FileText className="absolute top-4 right-4 text-purple-100 -rotate-12" size={48} />
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center gap-2"><FileText size={14} /> KYC Verification</h3>
                    <div className="space-y-3 text-sm">
                        {/* Access from kyc variable */}
                        <p className="text-slate-600 flex justify-between"><strong>ID Type:</strong> <span className="text-slate-900">{kyc.idProofType || "N/A"}</span></p>
                        <p className="text-slate-600 flex justify-between items-center"><strong>Status:</strong>
                            {kyc.idProofFrontImg ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full text-xs"><Check size={12} /> Uploaded</span>
                            ) : (
                                <span className="text-red-500 font-bold text-xs">Missing</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <button onClick={onEdit} className="px-8 py-3 bg-[#0f172a] text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95">
                    <Pencil size={16} /> Edit Profile Details
                </button>
            </div>
        </div>
    )
}