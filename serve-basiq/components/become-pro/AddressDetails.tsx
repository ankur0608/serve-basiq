import { memo, useState, useEffect } from "react";
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import Input from "@/components/ui/Input"; 

interface AddressDetailsProps {
    form: any;
    errors: Record<string, string>;
    onChange: (field: string, value: any) => void;
    onGetLocation: () => void;
    gettingLoc: boolean;
}

const AddressDetails = memo(({ form, errors, onChange, onGetLocation, gettingLoc }: AddressDetailsProps) => {
    const [fetchingPincode, setFetchingPincode] = useState(false);

    useEffect(() => {
        const fetchPincodeDetails = async () => {
            if (form.pincode && form.pincode.length === 6) {
                setFetchingPincode(true);
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${form.pincode}`);
                    const data = await response.json();
                    if (data && data[0].Status === 'Success') {
                        const details = data[0].PostOffice[0];
                        onChange('state', details.State);
                        onChange('district', details.District);
                        const cityVal = details.Block !== "NA" ? details.Block : details.Name;
                        onChange('city', cityVal);
                    }
                } catch (error) {
                    console.error("Error fetching pincode details:", error);
                } finally {
                    setFetchingPincode(false);
                }
            }
        };
        const timer = setTimeout(fetchPincodeDetails, 400);
        return () => clearTimeout(timer);
    }, [form.pincode, onChange]);

    const ErrorMsg = ({ field }: { field: string }) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors[field]}</p> : null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-2">
                <MapPin className="text-blue-600" size={20} /> <span className="font-bold text-slate-900">Business Address</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Input
                        label="ADDRESS LINE 1"
                        value={form.addressLine1}
                        onChange={e => onChange('addressLine1', e.target.value)}
                        placeholder="Flat, House No, Building"
                        className={errors.addressLine1 ? "border-red-500 focus:border-red-500" : ""}
                    />
                    <ErrorMsg field="addressLine1" />
                </div>

                <div className="col-span-2">
                    <Input
                        label="ADDRESS LINE 2 (OPTIONAL)"
                        value={form.addressLine2}
                        onChange={e => onChange('addressLine2', e.target.value)}
                        placeholder="Area, Street, Sector"
                    />
                </div>

                <div className="col-span-2">
                    <Input
                        label="LANDMARK (OPTIONAL)"
                        value={form.landmark}
                        onChange={e => onChange('landmark', e.target.value)}
                        placeholder="Near City Hospital"
                        className={errors.landmark ? "border-red-500 focus:border-red-500" : ""}
                    />
                    <ErrorMsg field="landmark" />
                </div>

                <div className="relative">
                    <Input
                        label="PINCODE"
                        value={form.pincode}
                        onChange={e => onChange('pincode', e.target.value.replace(/\D/g, ''))}
                        placeholder="174862"
                        maxLength={6}
                        className={errors.pincode ? "border-red-500 focus:border-red-500 pr-10" : "pr-10"}
                    />
                    {fetchingPincode && (
                        <div className="absolute right-3 top-[38px]">
                            <Loader2 className="animate-spin text-blue-500" size={16} />
                        </div>
                    )}
                    <ErrorMsg field="pincode" />
                </div>

                <div>
                    <Input
                        label="CITY"
                        value={form.city}
                        onChange={e => onChange('city', e.target.value)}
                        placeholder="City"
                        className={errors.city ? "border-red-500 focus:border-red-500" : ""}
                    />
                    <ErrorMsg field="city" />
                </div>

                <div>
                    <Input
                        label="DISTRICT"
                        value={form.district || ''}
                        onChange={e => onChange('district', e.target.value)}
                        placeholder="District"
                        className={errors.district ? "border-red-500 focus:border-red-500" : ""}
                    />
                    <ErrorMsg field="district" />
                </div>

                <div>
                    <Input
                        label="STATE"
                        value={form.state}
                        onChange={e => onChange('state', e.target.value)}
                        placeholder="State"
                        className={errors.state ? "border-red-500 focus:border-red-500" : ""}
                    />
                    <ErrorMsg field="state" />
                </div>

                <div className="col-span-2 pt-2">
                    <button
                        type="button"
                        onClick={onGetLocation}
                        disabled={gettingLoc}
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 py-3 rounded-xl font-bold transition disabled:opacity-70"
                    >
                        {gettingLoc ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                        {form.latitude !== 0 ? "Location Captured ✓" : "Get Current Location"}
                    </button>
                    {form.latitude !== 0 && (
                        <p className="text-xs text-center text-green-600 mt-2 font-mono">
                            Lat: {form.latitude.toFixed(5)}, Lng: {form.longitude.toFixed(5)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
});

AddressDetails.displayName = "AddressDetails";
export default AddressDetails;