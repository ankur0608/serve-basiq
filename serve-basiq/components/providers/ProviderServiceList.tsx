'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Loader2 } from 'lucide-react';

interface Props {
    service: any | null;
    userId: string;
    onEdit: () => void;
    onCreate: () => void;
}

export default function ProviderServiceList({ service, userId, onEdit, onCreate }: Props) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        setDeleting(true);
        try {
            const res = await fetch('/api/services/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, serviceId: service.id })
            });
            if (res.ok) window.location.reload();
            else alert("Failed to delete");
        } catch (error) { alert("Error"); }
        finally { setDeleting(false); }
    };

    if (!service) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center bg-white hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 rounded-xl group">
            {/* ID - Truncate UUID for display */}
            <div className="col-span-1 font-mono text-xs text-slate-400 truncate" title={service.id}>
                #{String(service.id).slice(-4).toUpperCase()} {/* Shows last 4 chars like #9B89 */}
            </div>

            {/* Name */}
            <div className="col-span-12 md:col-span-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {service.name}
            </div>

            {/* Category */}
            <div className="col-span-6 md:col-span-2">
                <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase">
                    {service.categoryId || "General"}
                </span>
            </div>

            {/* Rate - ✅ FIX: Handle Hourly vs Fixed */}
            <div className="col-span-6 md:col-span-2 font-medium text-slate-700">
                ₹{Number(service.price).toLocaleString()}
                <span className="text-xs text-slate-400 font-normal ml-1">
                    {service.priceType === 'HOURLY' ? '/hr' : ' (Fixed)'}
                </span>
            </div>

            {/* Status & Actions */}
            <div className="col-span-12 md:col-span-3 flex justify-end items-center gap-3">
                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit mr-auto md:mr-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active
                </span>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit size={16} />
                    </button>
                    <button onClick={handleDelete} disabled={deleting} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                        {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}