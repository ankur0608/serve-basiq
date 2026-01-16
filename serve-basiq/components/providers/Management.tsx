'use client';

import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { ServiceSettingsView } from '@/components/providers/ServiceSettingsView';
import ProviderServiceList from '@/components/providers/ProviderServiceList';

interface ServicesViewProps {
    currentUser: any;
    userData: any;
    services: any[];
    refetch: () => void;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    setActiveView: (view: string) => void;
}

export const ManagementView = ({
    currentUser,
    userData,
    services,
    refetch,
    showToast,
    setActiveView
}: ServicesViewProps) => {
    // Local state for service management moved here
    const [selectedServiceToEdit, setSelectedServiceToEdit] = useState<any>(null);
    const [isEditingService, setIsEditingService] = useState(false);
    const [isCreatingService, setIsCreatingService] = useState(false);

    const handleEditComplete = () => {
        setIsEditingService(false);
        setIsCreatingService(false);
        setSelectedServiceToEdit(null);
        refetch();
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex p-1.5 bg-white rounded-xl mb-6 max-w-md border border-slate-200 shadow-sm">
                <button
                    onClick={() => setActiveView('settings')}
                    className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-[#0f172a] text-white shadow-md transition-all"
                >
                    Services
                </button>
                <button
                    onClick={() => setActiveView('products')}
                    className="flex-1 py-2.5 text-sm font-bold rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                    Products
                </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <Package size={20} className="text-pink-500" /> My Services
                    </h3>
                    {!isEditingService && !isCreatingService && (
                        <button
                            onClick={() => setIsCreatingService(true)}
                            className="flex items-center gap-2 bg-[#0f172a] text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg text-sm font-bold"
                        >
                            <Plus size={16} /> Add Service
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {isEditingService || isCreatingService ? (
                        <ServiceSettingsView
                            userId={currentUser?.id || ""}
                            serviceData={isCreatingService ? null : selectedServiceToEdit}
                            userData={userData}
                            userAddress={userData?.addresses?.[0]}
                            showToast={showToast}
                            onComplete={handleEditComplete}
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2 mb-2">
                                <div className="col-span-1">ID</div>
                                <div className="col-span-4">Service Name</div>
                                <div className="col-span-2">Category</div>
                                <div className="col-span-2">Rate (INR)</div>
                                <div className="col-span-3 text-right">Status</div>
                            </div>
                            {services.map((svc: any) => (
                                <ProviderServiceList
                                    key={svc.id}
                                    service={svc}
                                    userId={currentUser?.id || ""}
                                    onEdit={() => {
                                        setSelectedServiceToEdit(svc);
                                        setIsEditingService(true);
                                    }}
                                    onCreate={() => setIsCreatingService(true)}
                                />
                            ))}
                            {services.length === 0 && (
                                <div className="text-center py-10 text-slate-400">
                                    No services found. Click "Add Service" to create one.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};