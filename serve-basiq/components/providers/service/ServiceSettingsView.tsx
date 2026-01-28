'use client';

import { X } from 'lucide-react';
import { useServiceForm, ServiceSettingsProps } from './service-logic';
import { StepOneBasic, StepTwoVisuals, StepThreeSchedule, StepFourPricing } from './ServiceSteps';

const defaultToast = (msg: string, type: 'success' | 'error') => alert(`${type.toUpperCase()}: ${msg}`);

export function ServiceSettingsView(props: ServiceSettingsProps) {
  const { onComplete, showToast = defaultToast, serviceData } = props;

  // Initialize Logic Hook
  const {
    step, setStep, loading, form, categories, loadingCats, activeSubCategories,
    handleChange, toggleSubCategory, toggleDay, handleImageUpload, removeGalleryImg,
    handleGetLocation, handleSubmit, gettingLoc, activeUploadField
  } = useServiceForm({ ...props, showToast });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full mx-auto relative flex flex-col max-h-[90vh]">

        <button onClick={onComplete} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition">
          <X size={24} />
        </button>

        {/* --- HEADER --- */}
        <div className="bg-slate-900 p-6 text-white relative shrink-0">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-bold">
              {serviceData ? 'Edit Service' : 'Create Service'}
            </h2>
            <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">
              Step {step} of 4
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {/* SCROLLABLE FORM AREA */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">

          {step === 1 && (
            <StepOneBasic
              form={form}
              handleChange={handleChange}
              categories={categories}
              loadingCats={loadingCats}
              activeSubCategories={activeSubCategories}
              toggleSubCategory={toggleSubCategory}
              setStep={setStep}
            />
          )}

          {step === 2 && (
            <StepTwoVisuals
              form={form}
              handleImageUpload={handleImageUpload}
              activeUploadField={activeUploadField}
              removeGalleryImg={removeGalleryImg}
              setStep={setStep}
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
              onComplete={onComplete}
              serviceData={serviceData}
            />
          )}

        </form>
      </div>
    </div>
  );
}