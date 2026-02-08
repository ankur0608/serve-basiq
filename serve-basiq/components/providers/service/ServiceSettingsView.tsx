'use client';

import { useEffect, useState } from 'react';
import { X, Hammer, Truck } from 'lucide-react';
import { useServiceForm, ServiceSettingsProps } from './service-logic';

// Import Steps
import { StepOneBasic } from './steps/StepOneBasic';
import { StepTwoVisuals, StepThreeSchedule, StepFourPricing } from './steps/StepsRemaining';

const defaultToast = (msg: string, type: 'success' | 'error') => alert(`${type.toUpperCase()}: ${msg}`);

export function ServiceSettingsView(props: ServiceSettingsProps) {
  const { onComplete, showToast = defaultToast, serviceData } = props;

  // ✅ STATE: Track the initial selection (only for Create Mode)
  // If editing (serviceData exists), we default to that type.
  const [initialType, setInitialType] = useState<'SERVICE' | 'RENTAL' | null>(
    serviceData ? (serviceData.listingType === 'RENTAL' || serviceData.rentalImg ? 'RENTAL' : 'SERVICE') : null
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">

      {/* SCENARIO 1: TYPE SELECTION SCREEN 
          Show this only if we are creating NEW (no serviceData) and haven't selected a type yet.
      */}
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
            {/* Option A: Regular Service */}
            <button
              onClick={() => setInitialType('SERVICE')}
              className="group p-6 rounded-xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 transition-all text-left flex flex-col items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                <Hammer size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700">Regular Service</h3>
                <p className="text-sm text-slate-500 mt-1">Provide expert skills, repairs, or tasks.</p>
              </div>
            </button>

            {/* Option B: Rental Service */}
            <button
              onClick={() => setInitialType('RENTAL')}
              className="group p-6 rounded-xl border-2 border-slate-100 hover:border-orange-600 hover:bg-orange-50 transition-all text-left flex flex-col items-start gap-4"
            >
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
        /* SCENARIO 2: MAIN FORM 
           Render the form wrapper once type is selected OR if editing.
        */
        <FormWrapper
          {...props}
          initialType={initialType!}
          // Allow going back to selection only if creating new
          onBack={!serviceData ? () => setInitialType(null) : undefined}
        />
      )}
    </div>
  );
}

// ✅ INTERNAL WRAPPER: Handles the Hook Logic only AFTER selection
function FormWrapper({ initialType, onBack, ...props }: ServiceSettingsProps & { initialType: 'SERVICE' | 'RENTAL', onBack?: () => void }) {

  const {
    step, setStep, loading, form, categories, loadingCats, activeSubCategories,
    gettingLoc, activeUploadField, listingType,
    handleChange, toggleSubCategory, toggleDay, handleImageUpload, removeGalleryImg,
    handleGetLocation, handleSubmit
  } = useServiceForm({ ...props, preSelectedType: initialType });

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full mx-auto relative flex flex-col max-h-[90vh]">

      <button
        onClick={props.onComplete}
        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition bg-black/20 hover:bg-black/40 rounded-full p-1"
      >
        <X size={20} />
      </button>

      {/* Header */}
      <div className="bg-slate-900 p-6 text-white relative shrink-0">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold">
            {props.serviceData
              ? `Edit ${listingType === 'RENTAL' ? 'Rental' : 'Service'}`
              : `Create ${listingType === 'RENTAL' ? 'Rental' : 'Service'}`
            }
          </h2>
          <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">
            Step {step} of 4
          </span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
          <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar">
        {step === 1 && (
          <StepOneBasic
            form={form}
            handleChange={handleChange}
            categories={categories}
            loadingCats={loadingCats}
            activeSubCategories={activeSubCategories}
            toggleSubCategory={toggleSubCategory}
            setStep={setStep}
            listingType={listingType}
            onBack={onBack} // Pass back handler
          />
        )}
        {step === 2 && (
          <StepTwoVisuals
            form={form}
            handleImageUpload={handleImageUpload}
            activeUploadField={activeUploadField}
            removeGalleryImg={removeGalleryImg}
            setStep={setStep}
            handleChange={handleChange}
          />
        )}
        {step === 3 && (
          <StepThreeSchedule
            form={form}
            handleChange={handleChange}
            handleGetLocation={handleGetLocation}
            gettingLoc={gettingLoc}
            toggleDay={toggleDay}
            setStep={setStep}
          />
        )}
        {step === 4 && (
          <StepFourPricing
            form={form}
            handleChange={handleChange}
            loading={loading}
            setStep={setStep}
            onComplete={props.onComplete}
            serviceData={props.serviceData}
            listingType={listingType}
          />
        )}
      </form>
    </div>
  );
}