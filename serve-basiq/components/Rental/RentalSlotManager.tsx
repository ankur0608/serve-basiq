'use client';

import { useState } from 'react';
import { Clock, Plus, Trash2, Loader2, AlertCircle, CalendarDays } from 'lucide-react';
import clsx from 'clsx';

export interface DraftSlot {
    id?: string;
    localId?: string;
    startTime: string;
    endTime: string;
    isBooked?: boolean;
}

interface Props {
    value: DraftSlot[];
    onChange: (slots: DraftSlot[]) => void;
    workingDays: string[];
    rentalId?: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const labelClass = 'block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider';
const inputClass =
    'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all';

export default function RentalSlotManager({ value, onChange, workingDays, rentalId }: Props) {
    const [draft, setDraft] = useState({ startTime: '09:00', endTime: '17:00' });
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = async () => {
        setError(null);

        if (!draft.startTime || !draft.endTime || draft.startTime >= draft.endTime) {
            setError('End time must be after start time.');
            return;
        }

        const duplicate = value.some(
            (s) => s.startTime === draft.startTime && s.endTime === draft.endTime
        );
        if (duplicate) {
            setError('That slot is already in the list.');
            return;
        }

        if (rentalId) {
            try {
                setBusyId('new');
                const res = await fetch(`/api/rentals/${rentalId}/slots`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slots: [draft] }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message || 'Failed to add slot');
                onChange([...value, { ...draft, id: data.slots?.[0]?.id }]);
            } catch (e: any) {
                setError(e.message || 'Could not add slot.');
            } finally {
                setBusyId(null);
            }
            return;
        }

        onChange([...value, { ...draft, localId: `local-${Date.now()}` }]);
    };

    const handleRemove = async (slot: DraftSlot) => {
        setError(null);

        if (slot.isBooked) {
            setError('This slot is already booked and cannot be removed.');
            return;
        }

        if (slot.id && rentalId) {
            try {
                setBusyId(slot.id);
                const res = await fetch(`/api/rentals/${rentalId}/slots/${slot.id}`, {
                    method: 'DELETE',
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message || 'Failed to remove slot');
            } catch (e: any) {
                setError(e.message || 'Could not remove slot.');
                setBusyId(null);
                return;
            }
            setBusyId(null);
        }

        onChange(value.filter((s) => (slot.id ? s.id !== slot.id : s.localId !== slot.localId)));
    };

    const selectedDays = DAYS.filter((d) => workingDays.includes(d));

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Clock className="text-orange-500" size={16} />
                <h4 className="text-sm font-bold text-slate-900">Available Time Slots</h4>
                <span className="ml-auto text-[11px] text-slate-400 font-medium">
                    {value.length} {value.length === 1 ? 'slot' : 'slots'} · applied to all working days
                </span>
            </div>

            {/* Add slot row */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end bg-white border border-slate-200 rounded-xl p-3">
                <div>
                    <label className={labelClass}>Start Time</label>
                    <input
                        type="time"
                        value={draft.startTime}
                        onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>End Time</label>
                    <input
                        type="time"
                        value={draft.endTime}
                        onChange={(e) => setDraft({ ...draft, endTime: e.target.value })}
                        className={inputClass}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={busyId === 'new'}
                    className="h-[42px] px-4 bg-orange-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-orange-600 transition disabled:opacity-60"
                >
                    {busyId === 'new' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Add
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {/* Schedule preview: each working day with its slots */}
            {selectedDays.length === 0 ? (
                <div className="text-center py-5 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    Select working days above to see the schedule.
                </div>
            ) : value.length === 0 ? (
                <div className="text-center py-5 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    No slots yet. Add time slots above — they apply to all selected working days.
                </div>
            ) : (
                <div className="space-y-2">
                    {selectedDays.map((day) => (
                        <div key={day} className="bg-white border border-slate-200 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2.5">
                                <CalendarDays size={13} className="text-orange-500" />
                                <span className="text-xs font-bold text-slate-700">{day}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {value.map((s) => {
                                    const key = s.id ?? s.localId ?? `${s.startTime}-${s.endTime}`;
                                    return (
                                        <div
                                            key={key}
                                            className={clsx(
                                                'group relative pl-3 pr-8 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5',
                                                s.isBooked
                                                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                                                    : 'bg-orange-50 border-orange-200 text-orange-800'
                                            )}
                                        >
                                            <Clock size={11} />
                                            {s.startTime} – {s.endTime}
                                            {s.isBooked && <span className="ml-1 text-[9px] uppercase font-bold">Booked</span>}
                                            {/* Only show remove on first day to avoid duplicate clicks */}
                                            {day === selectedDays[0] && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemove(s)}
                                                    disabled={s.isBooked || busyId === s.id}
                                                    title={s.isBooked ? 'Booked — cannot remove' : 'Remove slot'}
                                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/70 disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    {busyId === s.id ? (
                                                        <Loader2 size={11} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={11} />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
