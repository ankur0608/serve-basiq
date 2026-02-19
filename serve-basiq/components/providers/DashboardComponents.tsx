'use client';

import {
    Bell, Check, CalendarClock, MapPin, Clock, UserCircle, Lock
} from 'lucide-react';
import clsx from 'clsx';

// --- NAV BUTTON (Desktop Sidebar) ---
export function NavButton({ id, icon: Icon, label, active, set, badge, locked }: any) {
    const isActive = active === id;

    return (
        <button
            onClick={() => !locked && set(id)}
            disabled={locked}
            className={clsx(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group relative",
                isActive
                    ? "bg-slate-50 text-slate-900 font-bold"
                    : locked
                        ? "text-slate-300 cursor-not-allowed" // Locked style
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold"
            )}
        >
            {/* Active Indicator Bar */}
            <div className={clsx(
                "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#0f172a] rounded-r-full transition-opacity",
                isActive ? "opacity-100" : "opacity-0"
            )}></div>

            <Icon size={22} className={clsx("transition-transform duration-200", !isActive && !locked && "group-hover:scale-110")} />
            <span className="text-sm flex-1 text-left">{label}</span>

            {/* Badge or Lock Icon */}
            {locked ? (
                <Lock size={14} className="text-slate-300" />
            ) : badge && badge > 0 ? (
                <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {badge}
                </span>
            ) : null}
        </button>
    )
}

// --- MOBILE NAV BUTTON (Bottom Bar) ---
export function MobileNavBtn({ id, icon: Icon, label, active, set, locked }: any) {
    const isActive = active === id;

    return (
        <button
            onClick={() => !locked && set(id)}
            disabled={locked}
            className={clsx(
                "flex-1 flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                isActive
                    ? "text-slate-900"
                    : locked
                        ? "text-slate-300 cursor-not-allowed" // Locked style
                        : "text-slate-400"
            )}
        >
            <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {locked && (
                    <div className="absolute -top-1 -right-2 bg-slate-100 rounded-full p-0.5 border border-white">
                        <Lock size={10} className="text-slate-400" />
                    </div>
                )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}

// --- STAT CARD (Dashboard Metrics) ---
export function StatCard({ icon: Icon, label, value, trend, color = 'blue' }: any) {
    const bgColors: any = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-all duration-300 group cursor-default">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{value}</h3>
                </div>
                <div className={clsx("p-3 rounded-xl group-hover:scale-110 transition-transform", bgColors[color])}>
                    <Icon size={24} fill="currentColor" className="opacity-80" />
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                        + {trend}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">vs last month</span>
                </div>
            )}
        </div>
    )
}

// --- ACTIVITY ITEM (Recent Activity Feed) ---
export function ActivityItem({ type, title, time }: any) {
    return (
        <div className="ml-6 relative pl-2 pb-6 border-l border-slate-100 last:border-0 last:pb-0">
            <span className={clsx(
                "absolute -left-[9px] top-0 rounded-full w-4 h-4 flex items-center justify-center border-2 border-white ring-1 ring-slate-100",
                type === 'job' ? "bg-emerald-500" : "bg-blue-500"
            )}>
            </span>
            <p className="text-sm font-bold text-slate-800 leading-none mb-1">{type === 'job' ? 'Job Completed' : 'New Request'}</p>
            <p className="text-xs text-slate-500">{title}</p>
            <span className="text-[10px] text-slate-400 font-bold">{time}</span>
        </div>
    )
}

// --- REQUEST CARD (Job Requests) ---
export function RequestCard({ id, title, customer, location, price, urgent, onAccept, onReject }: any) {
    return (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 hover:border-slate-200 transition-colors">
            <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <CalendarClock size={24} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">#{id}</span>
                        <h3 className="font-bold text-slate-900">{title}</h3>
                        {urgent && <span className="bg-orange-50 text-orange-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Urgent</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1 font-medium"><UserCircle size={14} /> {customer}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {location}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 self-end md:self-center">
                <div className="text-right mr-4 hidden md:block">
                    <div className="text-lg font-bold text-slate-900">₹{price}</div>
                    <div className="text-xs text-slate-400">Est. Revenue</div>
                </div>
                <button onClick={onReject} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">Decline</button>
                <button onClick={onAccept} className="px-4 py-2 bg-[#0f172a] text-white rounded-lg text-sm font-bold hover:bg-slate-800 shadow-md transition-colors">Accept</button>
            </div>
        </div>
    )
}

// --- LEAD CARD (Potential Jobs) ---
export function LeadCard({ title, dist, time, category, color = "emerald" }: any) {
    const badges: any = {
        emerald: "bg-emerald-50 text-emerald-700",
        orange: "bg-orange-50 text-orange-700",
        blue: "bg-blue-50 text-blue-700"
    };

    return (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
                <span className={clsx("text-[10px] font-bold px-2.5 py-1 rounded-md", badges[color])}>{category}</span>
                <span className="text-xs text-slate-400 font-bold">{time}</span>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
            <div className="mt-auto space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <MapPin size={14} /> {dist} away
                </div>
                <button className="w-full py-2.5 bg-white border border-[#0284c7] text-[#0284c7] rounded-lg text-sm font-bold hover:bg-[#f0f9ff] transition">Send Quote</button>
            </div>
        </div>
    )
}