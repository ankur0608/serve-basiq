'use client';

import { Clock, AlignLeft, Calendar as CalendarIcon } from 'lucide-react';

interface BookingPreferencesProps {
    timeline: string;
    setTimeline: (val: string) => void;
    instructions: string;
    setInstructions: (val: string) => void;
    timelineOptions: { label: string; value: string }[];
    // ✅ Added new props for date, time, and 24/7 check
    is24x7?: boolean;
    bookingDate?: string;
    setBookingDate?: (val: string) => void;
    bookingTime?: string;
    setBookingTime?: (val: string) => void;
}

export default function BookingPreferences({
    timeline,
    setTimeline,
    instructions,
    setInstructions,
    timelineOptions,
    is24x7 = false,
    bookingDate,
    setBookingDate,
    bookingTime,
    setBookingTime
}: BookingPreferencesProps) {
    return (
        <div className="space-y-6">
            {/* Timeline Selection */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                    When do you need this?
                </label>
                <div className="relative group">
                    <Clock className="absolute left-4 top-4 text-slate-400" size={20} />
                    <select
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold text-slate-800 appearance-none cursor-pointer text-sm"
                    >
                        {timelineOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ✅ Conditionally render Date and Time pickers if NOT 24x7 */}
            {!is24x7 && setBookingDate && setBookingTime && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                            Select Date
                        </label>
                        <div className="relative group">
                            <CalendarIcon className="absolute left-4 top-4 text-slate-400" size={20} />
                            <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                            Select Time
                        </label>
                        <div className="relative group">
                            <Clock className="absolute left-4 top-4 text-slate-400" size={20} />
                            <input
                                type="time"
                                value={bookingTime}
                                onChange={(e) => setBookingTime(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Special Instructions */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
                    Special Instructions
                </label>
                <div className="relative group">
                    <AlignLeft className="absolute left-4 top-4 text-slate-400" size={20} />
                    <textarea
                        className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium text-slate-700"
                        placeholder="Gate code, specific issue, or landmarks..."
                        rows={3}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}