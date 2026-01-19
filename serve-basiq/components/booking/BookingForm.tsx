'use client';

import { useState } from 'react';
import { MapPin, ChevronRight, Loader2, Clock, AlignLeft, Plus, Pencil } from 'lucide-react';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
  price: number;
  userId: string;
  userAddresses: any[];
  onRequestClose: () => void;
}

// Enum values for the API
const TIMELINE_OPTIONS = [
  { label: 'Immediate', value: 'IMMEDIATE' },
  { label: 'In 2 Days', value: 'IN_2_DAYS' },
  { label: '2 to 5 Days', value: 'TWO_TO_FIVE_DAYS' }
];

export default function BookingForm({
  serviceId,
  serviceName,
  price,
  userId,
  userAddresses: initialAddresses,
  onRequestClose
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- Local State for Addresses ---
  const [addresses, setAddresses] = useState(initialAddresses);

  // Default to the first address if available
  const [addressId, setAddressId] = useState(addresses[0]?.id || '');
  const [timeline, setTimeline] = useState('IMMEDIATE');
  const [instructions, setInstructions] = useState('');

  // --- Modal State for Add/Edit Address ---
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null); // Null = Add Mode

  // --- Handlers ---

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (e: React.MouseEvent, addr: any) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (data: any) => {
    // 1. Optimistic Update (Update UI immediately)
    const newAddress = {
      id: editingAddress?.id || `temp-${Date.now()}`, // Temp ID used here
      userId,
      line1: data.addressLine1,
      line2: data.addressLine2,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      type: "Home", // Default
      country: "India"
    };

    let updatedList;
    if (editingAddress) {
      updatedList = addresses.map(a => a.id === editingAddress.id ? newAddress : a);
    } else {
      updatedList = [...addresses, newAddress];
      setAddressId(newAddress.id); // Auto-select the new address
    }

    setAddresses(updatedList);
    setIsAddressModalOpen(false);

    // Note: We don't save to backend immediately here. 
    // We let the Booking API handle the creation if it's a new address.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressId) {
      alert("Please select an address");
      return;
    }

    setLoading(true);

    try {
      // ✅ 1. Find the selected address object
      const selectedAddressObj = addresses.find(a => a.id === addressId);

      // ✅ 2. Prepare Payload
      const payload: any = {
        userId,
        serviceId,
        addressId,
        timeline,
        specialInstructions: instructions,
      };

      // ✅ 3. CHECK: If ID is temporary (starts with "temp-"), append full details
      if (addressId.toString().startsWith('temp-') && selectedAddressObj) {
        payload.newAddress = {
          line1: selectedAddressObj.line1,
          line2: selectedAddressObj.line2,
          landmark: selectedAddressObj.landmark,
          city: selectedAddressObj.city,
          state: selectedAddressObj.state,
          pincode: selectedAddressObj.pincode,
          type: (selectedAddressObj.type || "HOME").toUpperCase(), // Ensure enum match
        };
      }

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert('Booking Request Sent Successfully!');
        router.refresh(); // Refresh to get real IDs back
        onRequestClose();
      } else {
        alert(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Helper to prepopulate modal data
  const getModalInitialData = () => {
    if (editingAddress) {
      return {
        name: "",
        email: "",
        phone: "",
        addressLine1: editingAddress.line1 || "",
        addressLine2: editingAddress.line2 || "",
        landmark: editingAddress.landmark || "",
        city: editingAddress.city || "",
        state: editingAddress.state || "",
        pincode: editingAddress.pincode || ""
      };
    }
    return {
      name: "", email: "", phone: "",
      addressLine1: "", addressLine2: "", landmark: "", city: "", state: "", pincode: ""
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full mx-auto animate-in fade-in zoom-in-95 duration-200">

      {/* Header */}
      <div className="bg-slate-900 p-6 text-white">
        <h2 className="text-xl font-bold">Book Service</h2>
        <p className="text-slate-400 text-sm mt-1">
          Requesting: <span className="text-white font-medium">{serviceName}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* 1. Timeline Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            When do you need this?
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-900 appearance-none cursor-pointer"
            >
              {TIMELINE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-4 pointer-events-none">
              <ChevronRight className="rotate-90 text-slate-400" size={14} />
            </div>
          </div>
        </div>

        {/* 2. Address Selection */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Service Location
            </label>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={handleAddAddress}
                className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
              >
                <Plus size={12} /> Add New
              </button>
            )}
          </div>

          {addresses.length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {addresses.map((addr: any) => (
                <div
                  key={addr.id}
                  onClick={() => setAddressId(addr.id)}
                  className={`relative p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all group ${addressId === addr.id
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <MapPin className={`mt-0.5 flex-shrink-0 ${addressId === addr.id ? 'text-blue-600' : 'text-slate-400'}`} size={18} />
                  <div className="flex-1 pr-6">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-bold text-slate-900">{addr.type || "Home"}</p>
                      {addressId === addr.id && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Selected</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {addr.line1}, {addr.line2 ? addr.line2 + ', ' : ''}{addr.city} - {addr.pincode}
                    </p>
                    {addr.landmark && <p className="text-[10px] text-slate-400 mt-1">Landmark: {addr.landmark}</p>}
                  </div>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={(e) => handleEditAddress(e, addr)}
                    className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                    title="Edit Address"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddAddress}
              className="w-full p-6 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition">
                <Plus size={20} />
              </div>
              <span className="text-sm font-bold">Add Address</span>
            </button>
          )}
        </div>

        {/* 3. Special Instructions */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
            Special Instructions
          </label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
            <textarea
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Gate code, specific issue, or things to bring..."
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>

        {/* Footer / Submit */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 text-sm font-medium">Estimated Price</span>
            <span className="text-xl font-black text-slate-900">₹{price}</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onRequestClose}
              className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !addressId}
              className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
            </button>
          </div>
        </div>

      </form>

      {/* Address Edit/Add Modal */}
      {isAddressModalOpen && (
        <ProfileEditModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          initialData={getModalInitialData()}
          onSave={handleSaveAddress}
          isEmailLocked={true}
          isPhoneLocked={true}
        />
      )}

    </div>
  );
}