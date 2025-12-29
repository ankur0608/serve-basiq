'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, MapPin, Star, Briefcase, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
    service: any | null;
    userId: string;
    onEdit: () => void;   // Triggers Edit Mode (Prefilled)
    onCreate: () => void; // ✅ Triggers Create Mode (Empty)
}

export default function ProviderServiceList({ service, userId, onEdit, onCreate }: Props) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    // ✅ ROBUST IMAGE LOGIC
    // We prioritize the Service image if set, otherwise fallback to a placeholder.
    const serviceImage = service?.img || "https://via.placeholder.com/150?text=No+Image";
    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete your service profile?")) return;
        setDeleting(true);
        try {
            // ✅ Ensure this path is correct: /api/services/delete
            // And ensure method is DELETE
            const res = await fetch('/api/services/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    serviceId: service.id // ✅ Pass the specific service ID to be safe
                })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert("Failed to delete service");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setDeleting(false);
        }
    };
    // 1. EMPTY STATE
    if (!service) {
        return (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-blue-200 text-center animate-in fade-in shadow-sm">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No Service Profile Found</h3>
                <p className="text-gray-500 mb-8 mt-2 max-w-md mx-auto">
                    You haven't listed your services yet. Create a profile to start receiving job requests.
                </p>
                <button
                    onClick={onCreate}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg flex items-center gap-2 mx-auto"
                >
                    <Plus size={18} /> Create Service Profile
                </button>
            </div>
        );
    }

    // 2. FILLED STATE
    return (
        <div className="space-y-6">

            {/* Service Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Image Section */}
                        <div className="w-full md:w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                            <img
                                src={serviceImage}
                                alt={service.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "https://via.placeholder.com/150?text=Error";
                                }}
                            />
                        </div>

                        {/* Details Section */}
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-slate-900">{service.name}</h3>
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{service.desc}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-600">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">{service.categoryId || "General"}</span>
                                <span className="flex items-center gap-1"><MapPin size={16} className="text-red-500" /> {service.city}</span>
                                <span className="flex items-center gap-1"><Star size={16} className="text-amber-400 fill-current" /> <span className="font-bold text-slate-900">{Number(service.rating).toFixed(1)}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">

                    {/* ✅ FOOTER STATUS MESSAGE */}
                    <div className="text-xs font-medium text-gray-500">
                        {service.verified
                            ? <span className="text-green-600 font-bold">Profile is visible to customers</span>
                            : <span className="text-amber-600 font-bold flex items-center gap-1"><AlertTriangle size={12} /> Waiting for admin approval</span>
                        }
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onEdit} className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-gray-50">
                            <Edit size={16} /> Edit Details
                        </button>
                        <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-5 py-2 bg-white border border-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50">
                            {deleting ? "..." : <Trash2 size={16} />} Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}