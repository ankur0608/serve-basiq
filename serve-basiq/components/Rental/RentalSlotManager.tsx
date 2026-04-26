'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Clock, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export interface DraftSlot {
    id?: string;          // Server id (for already-saved slots)
    localId?: string;     // Client id (for unsaved drafts)
    date: string;         // YYYY-MM-DD
    startTime: string;    // HH:MM
    endTime: string;      // HH:MM
    isBooked?: boolean;
}

interface Props {
    /**
     * Controlled list of slots. Parent owns state so the rental form can
     * include them in its submit payload (via the `slots` field).
     */
    value: DraftSlot[];
    onChange: (slots: DraftSlot[]) => void;

    /**
     * Optional — when supplied, the component can persist/remove individual
     * slots directly against the server (used on the edit flow).
     */
    rentalId?: string;
}

const todayStr = () => new Date().toISOString().split('T')[0];

const labelClass = 'block text-[11px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider';
const inputClass =
    'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-medium bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all';

function isValidSlot(s: Pick<DraftSlot, 'date' | 'startTime' | 'endTime'>) {
    if (!s.date || !s.startTime || !s.endTime) return false;
    return s.startTime < s.endTime;
}

export default function RentalSlotManager({ value, onChange, rentalId }: Props) {
    const [draft, setDraft] = useState<DraftSlot>({
        date: todayStr(),
        startTime: '09:00',
        endTime: '12:00',
    });
    const [busyId, setBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const grouped = useMemo(() => {
        const map = new Map<string, DraftSlot[]>();
        for (const s of value) {
            const key = s.date;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(s);
        }
        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, slots]) => ({
                date,
                slots: slots.sort((a, b) => a.startTime.localeCompare(b.startTime)),
            }));
    }, [value]);

    const handleAdd = async () => {
        setError(null);

        if (!isValidSlot(draft)) {
            setError('End time must be after start time.');
            return;
        }

        const duplicate = value.some(
            (s) => s.date === draft.date && s.startTime === draft.startTime && s.endTime === draft.endTime
        );
        if (duplicate) {
            setError('That slot is already in the list.');
            return;
        }

        // Edit mode → persist immediately so the owner sees it live.
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

        // Create mode → keep as local draft, parent posts on form submit.
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

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <CalendarDays className="text-blue-600" size={16} />
                <h4 className="text-sm font-bold text-slate-900">Available Time Slots</h4>
                <span className="ml-auto text-[11px] text-slate-500">
                    {value.length} {value.length === 1 ? 'slot' : 'slots'}
                </span>
            </div>

            {/* Add-slot row */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr_auto] gap-3 items-end bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div>
                    <label className={labelClass}>Date</label>
                    <input
                        type="date"
                        min={todayStr()}
                        value={draft.date}
                        onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Start</label>
                    <input
                        type="time"
                        value={draft.startTime}
                        onChange={(e) => setDraft({ ...draft, startTime: e.target.value })}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>End</label>
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
                    className="h-[42px] px-4 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-700 transition shadow-sm shadow-blue-600/20 disabled:opacity-60"
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

            {/* Slot list */}
            {grouped.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                    No slots yet. Add the first one above — users will only be able to book dates/times you list here.
                </div>
            ) : (
                <div className="space-y-3">
                    {grouped.map(({ date, slots }) => (
                        <div key={date} className="bg-white border border-slate-200 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <CalendarDays size={14} className="text-slate-500" />
                                <span className="text-xs font-bold text-slate-700">
                                    {new Date(date).toLocaleDateString(undefined, {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {slots.map((s) => {
                                    const key = s.id ?? s.localId ?? `${s.date}-${s.startTime}`;
                                    return (
                                        <div
                                            key={key}
                                            className={clsx(
                                                'group relative pl-3 pr-8 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5',
                                                s.isBooked
                                                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                                                    : 'bg-blue-50 border-blue-200 text-blue-800'
                                            )}
                                        >
                                            <Clock size={12} />
                                            {s.startTime} – {s.endTime}
                                            {s.isBooked && <span className="ml-1 text-[10px] uppercase">Booked</span>}
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(s)}
                                                disabled={s.isBooked || busyId === s.id}
                                                title={s.isBooked ? 'Booked slot cannot be removed' : 'Remove slot'}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/70 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {busyId === s.id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={12} />
                                                )}
                                            </button>
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
