import Image from 'next/image';
import { services } from '@/lib/data';
import { notFound } from 'next/navigation';
import { FaStar, FaCheckCircle, FaLocationArrow } from 'react-icons/fa';

// Generate metadata dynamically for SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const service = services.find(s => s.id === parseInt(params.id));
  return { title: service ? `${service.name} | ServeMate` : 'Not Found' };
}

export default function ServiceDetail({ params }: { params: { id: string } }) {
  const service = services.find(s => s.id === parseInt(params.id));

  if (!service) return notFound();

  return (
    <div className="pb-32">
      {/* Hero Image */}
      <div className="h-64 md:h-96 bg-gray-900 relative">
        <img 
          src={service.img} 
          alt={service.name} 
        //   fill 
          className="object-cover opacity-80"
        //   priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-t-3xl shadow-soft p-6 border border-gray-100 min-h-screen">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 border-b border-gray-100 pb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                {service.name}
                {service.verified && <FaCheckCircle className="text-blue-500 text-xl" />}
              </h1>
              <p className="text-gray-500 text-sm mb-4 mt-2 flex items-center gap-2">
                <FaLocationArrow className="text-brand-500" /> {service.loc}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-brand-600">₹{service.price}<span className="text-sm font-normal text-gray-400">/hr</span></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 space-y-10">
               <h3 className="font-bold text-xl text-slate-900">About</h3>
               <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{service.desc}</p>
            </div>
            {/* Sidebar / Guarantee */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
              <h4 className="font-bold text-sm mb-4 text-slate-900 uppercase tracking-wide">Guarantee</h4>
              <ul className="space-y-4 text-sm text-gray-600">
                 <li className="flex gap-3">Verified Pro</li>
                 <li className="flex gap-3">Secure Pay</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 md:p-6 flex justify-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-up rounded-2xl p-4 w-full max-w-4xl pointer-events-auto flex items-center justify-between">
            <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">Estimated Total</div>
                <div className="font-extrabold text-2xl text-slate-900">₹{service.price}</div>
            </div>
            <button className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition">
                Book Now
            </button>
        </div>
      </div>
    </div>
  );
}