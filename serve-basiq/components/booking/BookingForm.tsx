'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Component imports
import BookingPreferences from './BookingPreferences';
import AddressSelection from './AddressSelection';
import AddressModal from './AddressModal';

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
  price: number;
  priceType?: string; // ✅ Added priceType
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
  priceType, // ✅ Destructured
  userId,
  userAddresses: initialAddresses,
  userDetails,
  onRequestClose,
  onSuccess
}: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [addresses, setAddresses] = useState(initialAddresses || []);
  const [addressId, setAddressId] = useState(addresses.length > 0 ? addresses[0].id : '');

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
    if (!addressId) {
      toast.error('Please select an address.');
      return;
    }
    setLoading(true);

    try {
      const selectedAddressObj = addresses.find((a: any) => a.id === addressId);

      let payload: any = {
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
          toast.success(priceType === 'QUOTE' ? 'Quote Request Sent!' : 'Booking Request Sent Successfully!');
          onRequestClose();
        }
        router.refresh();
      } else {
        toast.error(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getModalInitialData = () => {
    if (editingAddress) {
      return {
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
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 sm:px-6 py-5 text-white flex justify-between items-end shrink-0 shadow-md z-10 rounded-t-3xl sm:rounded-t-none relative overflow-hidden">

        {/* Decorative corner glow so it doesn't look flat */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

        {/* ✅ Left side (Title) - Pushed down with mt-6 to avoid close button */}
        <div className='flex flex-col justify-end flex-1 min-w-0 pr-4 relative z-10 mt-6'>
          <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 mb-1">
            {priceType === 'QUOTE' ? 'Requesting Quote' : 'Requesting Service'}
          </h2>
          <p className="text-white font-bold text-lg sm:text-xl leading-tight truncate">{serviceName}</p>
        </div>

        {/* ✅ Right side (Price) - Kept on one line, pushed down */}
        <div className="text-right flex flex-col items-end justify-end shrink-0 relative z-10 mt-6">
          {priceType === 'QUOTE' ? (
            <span className="text-xs sm:text-sm font-bold text-slate-300 whitespace-nowrap mb-0.5 pr-1">
              To be discussed
            </span>
          ) : (
            <>
              <span className="block text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 pr-1">Total</span>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight pr-1">₹{price}</span>
            </>
          )}
        </div>
      </div>

      {/* --- BODY --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 p-5 sm:p-6 space-y-6">
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
      </div>

      {/* --- FOOTER --- */}
      <div className="p-4 sm:px-6 pb-6 sm:pb-4 bg-white border-t border-slate-100 shrink-0 flex gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-10">
        <button
          type="button"
          onClick={onRequestClose}
          className="flex-1 py-3.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !addressId}
          className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : (priceType === 'QUOTE' ? 'Request Quote' : 'Confirm Booking')}
        </button>
      </div>

      {/* Address Edit/Add Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialData={getModalInitialData()}
        onSave={handleSaveAddress}
      />
    </div>
  );
}