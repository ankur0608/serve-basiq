import React from 'react';

interface TrustFeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string; // e.g., 'bg-blue-100'
  iconColor: string;   // e.g., 'text-blue-600'
}

interface TrustFeaturesProps {
  features: TrustFeatureItem[];
}

const TrustFeatures: React.FC<TrustFeaturesProps> = ({ features }) => {
  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
      {features.map((feature) => (
        <div 
          key={feature.id} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all"
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${feature.iconBgColor} ${feature.iconColor}`}>
            {feature.icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </section>
  );
};

export default TrustFeatures;