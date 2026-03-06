import React from 'react';

interface PromoBannerProps {
  badgeText?: string;
  title: string;
  subtitle: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

const PromoBanner: React.FC<PromoBannerProps> = ({
  badgeText = "FEATURED PARTNER",
  title,
  subtitle,
  buttonText = "Book Now",
  onButtonClick,
  className = ""
}) => {
  return (
    <div className={`w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-500 p-6 md:p-8 text-white shadow-lg my-6 ${className}`}>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          {badgeText && (
            <span className="inline-block bg-white/20 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded text-white/90 w-fit">
              {badgeText}
            </span>
          )}
          <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
          <p className="text-white/80 text-sm md:text-base">
            {subtitle}
          </p>
        </div>

        <button
          onClick={onButtonClick}
          className="bg-white text-purple-700 hover:bg-gray-50 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm whitespace-nowrap"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;