'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutGrid, BellRing, Search, Wallet, UserCircle,
    FileCheck, Settings, ShieldCheck, DollarSign, Briefcase,
    Star, Bell, Check, CalendarClock, MapPin, Clock,
    MessageSquare, Home, Filter, Info, UploadCloud, Crown,
    LogOut, Menu, X
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import clsx from 'clsx';

// Register ChartJS
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ProviderDashboard() {
    const { currentUser } = useUIStore();
    const router = useRouter();
    const [activeView, setActiveView] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch Data on Mount
    useEffect(() => {
        if (!currentUser) return;

        async function fetchStats() {
            try {
                const res = await fetch('/api/provider/stats', {
                    method: 'POST',
                    body: JSON.stringify({ userId: currentUser?.id })
                });
                const data = await res.json();
                if (data.success) {
                    setStats(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [currentUser]);

    // Simple Toast Logic
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'info' } | null>(null);
    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

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

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 text-blue-600 font-bold">Loading Dashboard...</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">

            {/* TOAST */}
            {toast && (
                <div className="fixed top-5 right-5 z-[100] animate-in slide-in-from-right duration-300">
                    <div className={clsx(
                        "flex items-center gap-3 p-4 rounded-lg border-l-4 shadow-xl bg-white min-w-[300px]",
                        toast.type === 'success' ? "border-green-500 text-green-700" :
                            toast.type === 'error' ? "border-red-500 text-red-700" : "border-blue-500 text-blue-700"
                    )}>
                        {toast.type === 'success' ? <Check size={20} /> : <Info size={20} />}
                        <span className="font-semibold text-sm">{toast.msg}</span>
                    </div>
                </div>
            )}

            {/* SIDEBAR (Desktop) */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-full shadow-sm z-20">
                <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-slate-900">ProviderOne</h1>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <NavButton id="dashboard" icon={LayoutGrid} label="Dashboard" active={activeView} set={setActiveView} />
                    <NavButton id="requests" icon={BellRing} label="Requests" active={activeView} set={setActiveView} badge={stats?.stats.pendingRequests} />
                    <NavButton id="leads" icon={Search} label="Leads" active={activeView} set={setActiveView} />
                    <NavButton id="earnings" icon={Wallet} label="Earnings" active={activeView} set={setActiveView} />
                    <NavButton id="profile" icon={UserCircle} label="Profile" active={activeView} set={setActiveView} />

                    <div className="pt-4 mt-4 border-t border-slate-100">
                        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System</p>
                        <NavButton id="documents" icon={FileCheck} label="Documents" active={activeView} set={setActiveView} />
                        <NavButton id="settings" icon={Settings} label="Settings" active={activeView} set={setActiveView} />
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition" onClick={() => setActiveView('profile')}>
                        <img src={stats?.service.img || "https://i.pravatar.cc/150"} className="w-10 h-10 rounded-full object-cover" alt="Profile" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{stats?.service.name}</p>
                            <p className="text-xs text-slate-500 truncate">{stats?.service.cat}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 h-full overflow-y-auto bg-slate-50/50 relative w-full pb-20 md:pb-0">

                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <ShieldCheck size={18} />
                        </div>
                        <span className="font-bold text-lg">ProviderOne</span>
                    </div>
                    <button onClick={() => setActiveView('profile')} className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                        <img src={stats?.service.img || "https://i.pravatar.cc/150"} className="w-full h-full object-cover" />
                    </button>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">

                    {/* --- VIEW: DASHBOARD --- */}
                    {activeView === 'dashboard' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-8 flex justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
                                    <p className="text-slate-500 text-sm mt-1">Welcome back, {stats?.service.name}!</p>
                                </div>
                                <span className="hidden md:flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                                </span>
                            </div>

                            {/* Stats Grid */}
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

                            {/* Chart Area */}
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
                    )}

                    {/* --- VIEW: REQUESTS --- */}
                    {activeView === 'requests' && (
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
                    )}

                    {/* --- VIEW: LEADS --- */}
                    {activeView === 'leads' && (
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
                    )}

                    {/* --- VIEW: EARNINGS --- */}
                    {activeView === 'earnings' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Earnings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl">
                                    <Wallet className="absolute top-0 right-0 m-8 w-32 h-32 opacity-10" />
                                    <p className="text-slate-400 font-medium mb-1">Available Balance</p>
                                    <h1 className="text-5xl font-bold mb-6">$450.00</h1>
                                    <button onClick={() => showToast('Payout Requested', 'success')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition">
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
                    )}

                    {/* --- VIEW: PROFILE --- */}
                    {activeView === 'profile' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                                <div className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-600 to-indigo-600 relative"></div>
                                <div className="px-6 pb-6 relative">
                                    <div className="flex justify-between items-end -mt-12 mb-4">
                                        <img src={stats?.service.img || "https://i.pravatar.cc/150"} className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white object-cover" />
                                        <button className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">Edit</button>
                                    </div>
                                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        {stats?.service.name} <ShieldCheck className="w-5 h-5 text-blue-500 fill-blue-100" />
                                    </h1>
                                    <p className="text-slate-500">{stats?.service.cat} Expert</p>
                                    <div className="mt-6">
                                        <h3 className="font-bold mb-2">About</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{stats?.service.desc}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* MOBILE BOTTOM NAV */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 flex justify-between px-6 py-2 z-40 pb-safe">
                <MobileNavBtn id="dashboard" icon={LayoutGrid} label="Home" active={activeView} set={setActiveView} />
                <MobileNavBtn id="requests" icon={BellRing} label="Requests" active={activeView} set={setActiveView} badge={true} />
                <MobileNavBtn id="leads" icon={Search} label="Leads" active={activeView} set={setActiveView} />
                <MobileNavBtn id="earnings" icon={Wallet} label="Earn" active={activeView} set={setActiveView} />
                <MobileNavBtn id="profile" icon={UserCircle} label="Profile" active={activeView} set={setActiveView} />
            </nav>
        </div>
    );
}

// --- SUB-COMPONENTS TO KEEP CODE CLEAN ---

function NavButton({ id, icon: Icon, label, active, set, badge }: any) {
    const isActive = active === id;
    return (
        <button onClick={() => set(id)} className={clsx(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group relative",
            isActive ? "text-blue-600 bg-blue-50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}>
            <Icon size={20} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
            {label}
            {badge && <span className="absolute right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
        </button>
    )
}

function MobileNavBtn({ id, icon: Icon, label, active, set, badge }: any) {
    const isActive = active === id;
    return (
        <button onClick={() => set(id)} className={clsx("flex flex-col items-center gap-1 p-2 rounded-xl transition-colors relative", isActive ? "text-blue-600" : "text-slate-400")}>
            <Icon size={24} />
            {badge && <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}

function StatCard({ icon: Icon, label, value, trend, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
    }
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between mb-4">
                <div className={clsx("p-2 rounded-lg", colors[color] || colors.blue)}><Icon size={20} /></div>
                {trend && <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            <p className="text-slate-400 text-xs font-medium">{label}</p>
        </div>
    )
}

function ActivityItem({ type, title, time }: any) {
    return (
        <div className="ml-6 relative">
            <span className={clsx("absolute -left-[31px] rounded-full w-6 h-6 flex items-center justify-center border-2 border-white", type === 'job' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600")}>
                {type === 'job' ? <Check size={12} /> : <Bell size={12} />}
            </span>
            <p className="text-sm font-semibold text-slate-800">{type === 'job' ? 'Job Completed' : 'New Request'}</p>
            <p className="text-xs text-slate-500">{title}</p>
            <span className="text-[10px] text-slate-400">{time}</span>
        </div>
    )
}

function RequestCard({ id, title, customer, location, price, urgent, color = "blue", onAccept, onReject }: any) {
    const [status, setStatus] = useState('pending');

    if (status !== 'pending') return null;

    const bg = color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600';
    const border = color === 'purple' ? 'group-hover:border-purple-400' : 'group-hover:border-blue-400';
    const bar = color === 'purple' ? 'bg-purple-500' : 'bg-blue-500';

    return (
        <div className={clsx("bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group transition-all", border)}>
            <div className={clsx("absolute top-0 left-0 w-1 h-full", bar)}></div>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex gap-4">
                    <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center shrink-0", bg)}>
                        <CalendarClock size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{title}</h3>
                            {urgent && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Urgent</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><UserCircle size={12} /> {customer}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {location}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> Today, 5:00 PM</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end justify-center gap-3 min-w-[150px]">
                    <div className="text-xl font-bold text-slate-900">${price}</div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => { onReject(); setStatus('rejected'); }} className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">Reject</button>
                        <button onClick={() => { onAccept(); setStatus('accepted'); }} className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors">Accept</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LeadCard({ title, dist, time, category, color = "green" }: any) {
    const badges: any = {
        green: "bg-green-100 text-green-700",
        orange: "bg-orange-100 text-orange-700",
        blue: "bg-blue-100 text-blue-700"
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
                <span className={clsx("text-[10px] font-bold px-2 py-1 rounded", badges[color])}>{category}</span>
                <span className="text-xs text-slate-400">{time}</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
            <div className="mt-auto space-y-3 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={12} /> {dist} away
                </div>
                <button className="w-full py-2 bg-white border border-blue-600 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition">Send Quote</button>
            </div>
        </div>
    )
}