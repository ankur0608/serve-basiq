'use client';

import { Clock, AlignLeft } from 'lucide-react';

interface BookingPreferencesProps {
    timeline: string;
    setTimeline: (val: string) => void;
    instructions: string;
    setInstructions: (val: string) => void;
    timelineOptions: { label: string; value: string }[];
}

export default function BookingPreferences({
    timeline,
    setTimeline,
    instructions,
    setInstructions,
    timelineOptions,
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