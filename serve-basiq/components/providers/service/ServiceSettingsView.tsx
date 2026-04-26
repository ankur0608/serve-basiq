'use client';

import { useState } from 'react';
import { X, Hammer, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useServiceForm, ServiceSettingsProps } from './service-logic'; // Ensure this path is correct
import { StepOneDetails, StepTwoMedia } from './steps/StepOneBasic'; // Ensure this path is correct

const defaultToast = (msg: string, type: 'success' | 'error') => alert(`${type.toUpperCase()}: ${msg}`);

export function ServiceSettingsView(props: ServiceSettingsProps) {
  const { onComplete, showToast = defaultToast, serviceData } = props;

  const [initialType, setInitialType] = useState<'SERVICE' | 'RENTAL' | null>(
    serviceData ? (serviceData.listingType === 'RENTAL' || serviceData.rentalImg ? 'RENTAL' : 'SERVICE') : null
  );

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {!serviceData && !initialType ? (
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative animate-in zoom-in-95 duration-200">
          <button onClick={onComplete} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Type</h2>
            <p className="text-slate-500">Choose the type of listing you want to add</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => setInitialType('SERVICE')} className="group p-6 rounded-xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all text-left flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                <Hammer size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700">Regular Service</h3>
                <p className="text-sm text-slate-500 mt-1">Provide expert skills, repairs, or tasks.</p>
              </div>
            </button>

            <button onClick={() => setInitialType('RENTAL')} className="group p-6 rounded-xl border-2 border-slate-100 hover:border-orange-600 hover:bg-orange-50 transition-all text-left flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-orange-700">Rental Service</h3>
                <p className="text-sm text-slate-500 mt-1">Rent out products, vehicles, or equipment.</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <FormWrapper
          {...props}
          initialType={initialType!}
          onBack={!serviceData ? () => setInitialType(null) : undefined}
        />
      )}
    </div>
  );
}

function FormWrapper({ initialType, onBack, ...props }: ServiceSettingsProps & { initialType: 'SERVICE' | 'RENTAL', onBack?: () => void }) {
  const {
    step, setStep, loading, form, categories, loadingCats, activeSubCategories,
    gettingLoc, activeUploadField, listingType, uploading,
    handleChange, toggleSubCategory, toggleDay, handleImageUpload,
    uploadMultipleFiles, removeGalleryImg, removeServiceImage,
    handleGetLocation, handleSubmit
  } = useServiceForm({ ...props, preSelectedType: initialType });

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full mx-auto relative flex flex-col max-h-[90vh]">
      <button onClick={props.onComplete} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition bg-black/20 hover:bg-black/40 rounded-full p-1">
        <X size={20} />
      </button>

      {/* Header */}
      <div className="bg-slate-900 p-6 text-white relative shrink-0">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">
              {props.serviceData
                ? `Edit ${listingType === 'RENTAL' ? 'Rental' : 'Service'}`
                : `Create ${listingType === 'RENTAL' ? 'Rental' : 'Service'}`
              }
            </h2>

            {props.serviceData && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${props.serviceData.isVerified
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                {props.serviceData.isVerified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {props.serviceData.isVerified ? 'Verified' : 'Pending Verification'}
              </div>
            )}
          </div>

          <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">
            Step {step} of 2
          </span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
          <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${(step / 2) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 transition-colors p-6">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <StepOneDetails
              form={form}
              handleChange={handleChange}
              categories={categories}
              loadingCats={loadingCats}
              activeSubCategories={activeSubCategories}
              setStep={setStep}
              listingType={listingType}
              onBack={onBack}
              handleGetLocation={handleGetLocation}
              gettingLoc={gettingLoc}
              toggleDay={toggleDay}
              serviceId={props.serviceData?.id}
            />
          )}

          {step === 2 && (
            <StepTwoMedia
              form={form}
              setStep={setStep}
              handleImageUpload={handleImageUpload}
              uploadMultipleFiles={uploadMultipleFiles}
              activeUploadField={activeUploadField}
              removeGalleryImg={removeGalleryImg}
              removeServiceImage={removeServiceImage}
              processingMsg={uploading ? "Uploading..." : undefined}
              loading={loading}
              serviceData={props.serviceData}
              onComplete={props.onComplete}
            />
          )}
        </form>
      </div>
    </div>
  );
}