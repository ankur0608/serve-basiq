'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // ✅ Imported toast

// Component imports
import BookingPreferences from './BookingPreferences';
import AddressSelection from './AddressSelection';
import AddressModal from './AddressModal';

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
  price: number;
  userId: string;
  userAddresses: any[];
  is24x7?: boolean;
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
  is24x7 = false,
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

  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

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
      toast.error('Please select an address.'); // ✅ Added quick validation toast
      return;
    }
    setLoading(true);

    try {
      const selectedAddressObj = addresses.find((a: any) => a.id === addressId);

      // ✅ FIXED: Changed 'const' to 'let' so we can attach 'newAddress' later
      let payload: any = {
        userId,
        serviceId,
        addressId,
        timeline,
        specialInstructions: instructions,
        bookingDate: is24x7 ? "" : bookingDate,
        bookingTime: is24x7 ? "" : bookingTime,
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
          toast.success('Booking Request Sent Successfully!'); 
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
      {/* ✅ FIXED: Adjusted padding and layout so the text doesn't clash with any close buttons injected from the wrapper */}
      <div className="bg-slate-900 px-5 sm:px-6 py-4 sm:py-5 text-white flex justify-between items-center shrink-0 shadow-md z-10 rounded-t-3xl sm:rounded-t-none">
        <div className='flex flex-col justify-center max-w-[60%]'>
          <h2 className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-0.5">Requesting Service</h2>
          <p className="text-white font-bold text-base sm:text-lg leading-tight truncate">{serviceName}</p>
        </div>
        <div className="text-right flex flex-col items-end justify-center">
          <span className="block text-[10px] sm:text-xs font-medium text-slate-400 mb-0.5 mt-4 sm:mt-7">Total Amount</span>
          <span className="text-lg sm:text-xl font-bold text-white tracking-tight">₹{price}</span>
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
          is24x7={is24x7}
          bookingDate={bookingDate}
          setBookingDate={setBookingDate}
          bookingTime={bookingTime}
          setBookingTime={setBookingTime}
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
      {/* ✅ FIXED: Added padding-bottom for safe areas on mobile devices (pb-safe or explicitly adding pb-6/pb-8) to prevent cutoff */}
      <div className="p-4 sm:px-6 pb-6 sm:pb-4 bg-white border-t border-slate-100 shrink-0 flex gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-10">
        <button
          type="button"
          onClick={onRequestClose}
          className="flex-1 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !addressId}
          className="flex-[2] zbg-slate-900 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
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