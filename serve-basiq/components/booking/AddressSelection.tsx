import { Plus, Pencil } from 'lucide-react';
import clsx from 'clsx';

interface AddressSelectionProps {
    addresses: any[];
    addressId: string;
    setAddressId: (id: string) => void;
    handleAddAddress: () => void;
    handleEditAddress: (e: React.MouseEvent, addr: any) => void;
}

export default function AddressSelection({
    addresses,
    addressId,
    setAddressId,
    handleAddAddress,
    handleEditAddress
}: AddressSelectionProps) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">
                    Location
                </label>
                {addresses.length > 0 && (
                    <button
                        type="button"
                        onClick={handleAddAddress}
                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition"
                    >
                        <Plus size={14} /> Add New
                    </button>
                )}
            </div>

            {addresses.length > 0 ? (
                <div className="space-y-3">
                    {addresses.map((addr: any) => (
                        <div
                            key={addr.id}
                            onClick={() => setAddressId(addr.id)}
                            className={clsx(
                                "relative p-4 rounded-2xl border cursor-pointer flex items-start gap-4 transition-all duration-200",
                                addressId === addr.id
                                    ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            )}
                        >
                            {/* Radio Indicator */}
                            <div className={clsx(
                                "mt-1 h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                                addressId === addr.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                            )}>
                                {addressId === addr.id && <div className="h-2 w-2 bg-white rounded-full" />}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={clsx("text-sm font-bold", addressId === addr.id ? 'text-blue-700' : 'text-slate-900')}>
                                        {addr.type || "Home"}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                                    {addr.line1}, {addr.city}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => handleEditAddress(e, addr)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition"
                            >
                                <Pencil size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleAddAddress}
                    className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                >
                    <div className="p-3 bg-slate-100 rounded-full group-hover:bg-blue-100 transition-colors">
                        <Plus size={20} />
                    </div>
                    <span className="text-sm font-bold">Add Service Address</span>
                </button>
            )}
        </div>
    );
}