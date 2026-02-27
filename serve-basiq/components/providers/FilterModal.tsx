// components/FilterModal.tsx
import { X, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { TabType, STATUS_TABS } from '@/app/hook/useRequestsLogic';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: TabType;
    onSelectTab: (tabId: TabType) => void;
    currentData: any[];
}

export default function FilterModal({ isOpen, onClose, activeTab, onSelectTab, currentData }: FilterModalProps) {
    if (!isOpen) return null;

    // Helper to calculate badge numbers
    const getTabCount = (tabId: TabType) => {
        return currentData.filter((i: any) => {
            const s = i.displayStatus;
            if (tabId === 'ALL') return true;
            if (tabId === 'PENDING') return ['PENDING', 'REQUESTED'].includes(s);
            if (tabId === 'CANCELLED') return ['CANCELLED', 'REJECTED', 'RETURNED'].includes(s);
            if (tabId === 'COMPLETED') return ['COMPLETED', 'DELIVERED', 'RETURNED'].includes(s);
            if (tabId === 'ACTIVE') return ['ACCEPTED', 'APPROVED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'IN_PROGRESS', 'ACTIVE', 'OVERDUE'].includes(s);
            return false;
        }).length;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm md:hidden">
            {/* The modal container - strict styling ensures it stays centered and limits height */}
            <div className="bg-white w-full max-w-[340px] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Filter Status</h3>
                        <p className="text-xs text-slate-500 mt-1">Select the request phase you want to see.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable list of tabs */}
                <div className="space-y-3 pb-2 overflow-y-auto no-scrollbar flex-1">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                onSelectTab(tab.id);
                                onClose();
                            }}
                            className={clsx(
                                "w-full flex items-center justify-between p-4 rounded-xl border transition-all font-bold text-sm",
                                activeTab === tab.id
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 active:scale-[0.98]"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={clsx("p-2 rounded-lg", activeTab === tab.id ? "bg-white/20" : "bg-slate-100")}>
                                    <tab.icon size={18} className={activeTab === tab.id ? "text-white" : "text-slate-500"} />
                                </div>
                                {tab.label}
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={clsx("px-2.5 py-1 rounded-full text-xs", activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 font-medium")}>
                                    {getTabCount(tab.id)}
                                </span>
                                {activeTab === tab.id && <CheckCircle2 size={20} className="text-white" />}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}