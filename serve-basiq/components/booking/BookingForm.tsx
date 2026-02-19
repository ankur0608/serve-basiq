'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import { useRouter } from 'next/navigation';

// Import your new split components
import BookingPreferences from './BookingPreferences';
import AddressSelection from './AddressSelection';

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
  { label: 'Urgent (ASAP)', value: 'URGENT' },
  { label: 'Immediate', value: 'IMMEDIATE' },
  { label: 'Later', value: 'LATER' },
  { label: 'Flexible', value: 'FLEXIBLE' }
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
      district: data.district || '',
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
          district: selectedAddressObj.district,
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
        district: editingAddress.district || "",
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
      district: "",
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

        <BookingPreferences
          timeline={timeline}
          setTimeline={setTimeline}
          instructions={instructions}
          setInstructions={setInstructions}
          timelineOptions={TIMELINE_OPTIONS}
        />

        <AddressSelection
          addresses={addresses}
          addressId={addressId}
          setAddressId={setAddressId}
          handleAddAddress={handleAddAddress}
          handleEditAddress={handleEditAddress}
        />

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