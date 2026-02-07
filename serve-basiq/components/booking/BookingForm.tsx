'use client';

import { useState } from 'react';
import {
  MapPin, Plus, Loader2, Pencil, Clock, AlignLeft, CheckCircle2
} from 'lucide-react';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
  price: number;
  userId: string;
  userAddresses: any[];
  userDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    dob?: string;
  };
  onRequestClose: () => void;
  onSuccess?: () => void;
}

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
  userDetails,
  onRequestClose,
  onSuccess
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [addresses, setAddresses] = useState(initialAddresses || []);
  const [addressId, setAddressId] = useState(addresses.length === 1 ? addresses[0].id : '');

  const [timeline, setTimeline] = useState('IMMEDIATE');
  const [instructions, setInstructions] = useState('');

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

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
    const newAddress = {
      id: editingAddress?.id || `temp-${Date.now()}`,
      userId,
      line1: data.addressLine1,
      line2: data.addressLine2,
      landmark: data.landmark,
      city: data.city,
      district: data.district || '', // ✅ Save district as well
      state: data.state,
      pincode: data.pincode,
      type: "Home",
      country: "India"
    };

    let updatedList;
    if (editingAddress) {
      updatedList = addresses.map((a: any) => a.id === editingAddress.id ? newAddress : a);
    } else {
      updatedList = [...addresses, newAddress];
      setAddressId(newAddress.id);
    }

    setAddresses(updatedList);
    setIsAddressModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressId) return;
    setLoading(true);

    try {
      const selectedAddressObj = addresses.find((a: any) => a.id === addressId);
      const payload: any = {
        userId,
        serviceId,
        addressId,
        timeline,
        specialInstructions: instructions,
      };

      if (addressId.toString().startsWith('temp-') && selectedAddressObj) {
        payload.newAddress = {
          line1: selectedAddressObj.line1,
          line2: selectedAddressObj.line2,
          landmark: selectedAddressObj.landmark,
          city: selectedAddressObj.city,
          district: selectedAddressObj.district, // ✅ Include district in payload
          state: selectedAddressObj.state,
          pincode: selectedAddressObj.pincode,
          type: (selectedAddressObj.type || "HOME").toUpperCase(),
        };
      }

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          alert('Booking Request Sent Successfully!');
          onRequestClose();
        }
        router.refresh();
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

  const getModalInitialData = () => {
    if (editingAddress) {
      return {
        name: userDetails?.name || "",
        email: userDetails?.email || "",
        phone: userDetails?.phone || "",
        dateOfBirth: userDetails?.dob || "",
        preferredLanguage: "English",
        addressLine1: editingAddress.line1 || "",
        addressLine2: editingAddress.line2 || "",
        landmark: editingAddress.landmark || "",
        city: editingAddress.city || "",
        district: editingAddress.district || "", // ✅ ADDED THIS
        state: editingAddress.state || "",
        pincode: editingAddress.pincode || ""
      };
    }
    return {
      name: userDetails?.name || "",
      email: userDetails?.email || "",
      phone: userDetails?.phone || "",
      dateOfBirth: userDetails?.dob || "",
      preferredLanguage: "English",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      district: "", // ✅ ADDED THIS
      state: "",
      pincode: ""
    };
  };

  return (
    <div className="bg-white w-full h-full flex flex-col overflow-hidden relative">

      {/* --- HEADER --- */}
      <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center shrink-0 shadow-md z-10">
        <div className='flex flex-col justify-center'>
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Requesting Service</h2>
          <p className="text-white font-bold text-lg leading-tight truncate max-w-[220px]">{serviceName}</p>
        </div>
        <div className="text-right flex flex-col items-end justify-center">
          <span className="block text-xs font-medium text-slate-400 mb-0.5">Total Amount</span>
          <span className="text-xl font-bold text-white tracking-tight">₹{price}</span>
        </div>
      </div>

      {/* --- BODY --- */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">

        {/* 1. Timeline */}
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
              {TIMELINE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Address */}
        <div>
          <div className="flex justify-between items-center mb-2 ml-1">
            <label className="block text-xs font-bold text-slate-500 uppercase">
              Location
            </label>
            {addresses.length > 0 && (
              <button type="button" onClick={handleAddAddress} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition">
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

        {/* 3. Instructions */}
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

        <div className="h-4"></div>
      </form>

      {/* --- FOOTER --- */}
      <div className="p-4 px-6 bg-white border-t border-slate-100 shrink-0 flex gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-10">
        <button
          type="button"
          onClick={onRequestClose}
          className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !addressId}
          className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
        </button>
      </div>

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