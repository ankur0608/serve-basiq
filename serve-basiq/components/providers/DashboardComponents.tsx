'use client';

import { useState } from 'react';
import {
    Bell, Check, CalendarClock, MapPin, Clock, UserCircle
} from 'lucide-react';
import clsx from 'clsx';

export function NavButton({ id, icon: Icon, label, active, set, badge }: any) {
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

export function MobileNavBtn({ id, icon: Icon, label, active, set, badge }: any) {
    const isActive = active === id;
    return (
        <button onClick={() => set(id)} className={clsx("flex flex-col items-center gap-1 p-2 rounded-xl transition-colors relative", isActive ? "text-blue-600" : "text-slate-400")}>
            <Icon size={24} />
            {badge && <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}

export function StatCard({ icon: Icon, label, value, trend, color }: any) {
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

export function ActivityItem({ type, title, time }: any) {
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

export function RequestCard({ id, title, customer, location, price, urgent, color = "blue", onAccept, onReject }: any) {
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

export function LeadCard({ title, dist, time, category, color = "green" }: any) {
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