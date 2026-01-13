'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Home, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import { useUIStore } from '@/lib/store'; // Assuming you have a store for user data

interface BookingFormProps {
  serviceId: string;
  serviceName: string;
  price: number;
  userId: string;
  userAddresses: any[]; // Pass user's saved addresses
  onRequestClose: () => void;
}

export default function BookingForm({ serviceId, serviceName, price, userId, userAddresses, onRequestClose }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [addressId, setAddressId] = useState(userAddresses[0]?.id || '');
  const [propertyType, setPropertyType] = useState('FLAT');
  const [instructions, setInstructions] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          serviceId,
          addressId,
          bookingDate: date,
          timeSlot,
          propertyType,
          specialInstructions: instructions,
          paymentMode
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        alert('Booking Request Sent Successfully!');
        onRequestClose(); // Close modal or redirect
      } else {
        alert(data.message || 'Booking failed');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="bg-slate-900 p-6 text-white">
        <h2 className="text-xl font-bold">Book Service</h2>
        <p className="text-slate-400 text-sm mt-1">Requesting: <span className="text-white font-medium">{serviceName}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Step 1: Schedule */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Time</label>
              <div className="grid grid-cols-3 gap-2">
                {['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2 text-sm font-medium rounded-lg border transition-all ${
                      timeSlot === slot 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'border-slate-200 text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="button" 
              disabled={!date || !timeSlot}
              onClick={() => setStep(2)}
              className="w-full mt-4 bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Location & Details */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            
            {/* Address Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Service Location</label>
              {userAddresses.length > 0 ? (
                <div className="space-y-2">
                  {userAddresses.map((addr) => (
                    <div 
                      key={addr.id}
                      onClick={() => setAddressId(addr.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                        addressId === addr.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <MapPin className={`mt-0.5 ${addressId === addr.id ? 'text-blue-600' : 'text-slate-400'}`} size={18} />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{addr.type}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{addr.line1}, {addr.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center text-sm text-slate-500">
                  No saved addresses. Please add one in your profile.
                </div>
              )}
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Property Type</label>
              <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                {['FLAT', 'VILLA', 'OFFICE'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      propertyType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Special Instructions</label>
              <textarea 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Gate code, specific issue, etc."
                rows={2}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button 
                type="button" 
                onClick={() => setStep(3)}
                disabled={!addressId}
                className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50"
              >
                Proceed <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment & Confirm */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-bold text-slate-900">{date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Time</span>
                <span className="font-bold text-slate-900">{timeSlot}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-900 font-bold">Total Estimate</span>
                <span className="font-bold text-blue-600 text-lg">₹{price}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Payment Method</label>
              <div className="space-y-3">
                <div 
                  onClick={() => setPaymentMode('CASH')}
                  className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-all ${
                    paymentMode === 'CASH' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <span className="font-bold text-lg">₹</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Cash after Service</p>
                    <p className="text-xs text-slate-500">Pay directly to the provider</p>
                  </div>
                  {paymentMode === 'CASH' && <div className="w-4 h-4 rounded-full bg-green-500"></div>}
                </div>

                <div 
                  onClick={() => setPaymentMode('ONLINE')}
                  className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-all ${
                    paymentMode === 'ONLINE' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <CreditCard size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Online Payment</p>
                    <p className="text-xs text-slate-500">UPI, Card, Netbanking</p>
                  </div>
                  {paymentMode === 'ONLINE' && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-[2] bg-slate-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg shadow-slate-200"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}