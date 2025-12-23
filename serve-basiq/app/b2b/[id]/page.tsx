'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaArrowLeft, FaHeart, FaRegHeart, FaBuilding, FaCircleCheck,
  FaTruckFast, FaBox, FaRotateLeft, FaPaperPlane, FaCommentDots
} from 'react-icons/fa6';
import clsx from 'clsx';

// Define the shape of our Product data (Matches Prisma/API)
interface Product {
  id: number;
  name: string;
  cat: string;
  price: number;
  moq: string;
  supplier: string;
  img: string;
  desc: string;
  // Add other fields if your API returns them
}

type Params = {
  id: string;
};

export default function ProductDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = use(params); // Next.js 15 Unwrap
  const router = useRouter();

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'ship'>('desc');
  const [isFav, setIsFav] = useState(false);

  // Fetch Data on Mount
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/b2b/${id}`);
        if (!res.ok) {
          // If 404 or error, you might want to redirect or show error
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Product...</p>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  // Mock Specs (You can move this to DB later if needed)
  const specs = [
    { label: "Material", value: "Premium Grade" },
    { label: "MOQ", value: product.moq }, // Use real MOQ
    { label: "Category", value: product.cat },
    { label: "Warranty", value: "Standard Manufacturer" },
    { label: "Certification", value: "Verified Supplier" },
  ];

  return (
    <div className="pb-32 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-8 md:gap-12">

        {/* ================= LEFT: GALLERY ================= */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-center justify-center relative h-[300px] md:h-[500px] group overflow-hidden">
            {/* Using Next.js Image for optimization */}
            <div className="relative w-full h-full">
              <Image
                src={product.img}
                alt={product.name}
                fill
                className="object-contain mix-blend-multiply relative z-10 hover:scale-110 transition duration-700"
              />
            </div>

            <button onClick={() => router.back()} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-slate-900 z-20 transition">
              <FaArrowLeft />
            </button>
            <button onClick={() => setIsFav(!isFav)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 z-20 transition">
              {isFav ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 p-2 rounded-xl h-20 md:h-24 flex items-center justify-center cursor-pointer hover:border-blue-500 transition relative">
                <Image src={product.img} alt="thumb" fill className="object-contain mix-blend-multiply p-2" />
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT: INFO ================= */}
        <div className="pt-4">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span> In Stock
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">{product.name}</h1>

          <div className="flex items-end gap-2 mb-8">
            <div className="text-4xl font-extrabold text-slate-900">₹{product.price}</div>
            <span className="text-gray-500 text-base mb-1.5 font-medium">/ unit (excl. GST)</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-2xl text-slate-400"><FaBuilding /></div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold">Supplier</div>
              <div className="font-bold text-slate-900 text-lg flex items-center gap-2">{product.supplier} <FaCircleCheck className="text-blue-500 text-sm" /></div>
            </div>
            <button className="ml-auto text-sm font-bold text-blue-600 hover:underline">View Profile</button>
          </div>

          {/* TABS HEADER */}
          <div className="flex border-b border-gray-200 mb-6">
            <button onClick={() => setActiveTab('desc')} className={clsx("pb-3 mr-8 font-bold text-sm transition border-b-2", activeTab === 'desc' ? "border-slate-900 text-slate-900" : "border-transparent text-gray-400 hover:text-slate-600")}>Description</button>
            <button onClick={() => setActiveTab('specs')} className={clsx("pb-3 mr-8 font-bold text-sm transition border-b-2", activeTab === 'specs' ? "border-slate-900 text-slate-900" : "border-transparent text-gray-400 hover:text-slate-600")}>Specifications</button>
            <button onClick={() => setActiveTab('ship')} className={clsx("pb-3 font-bold text-sm transition border-b-2", activeTab === 'ship' ? "border-slate-900 text-slate-900" : "border-transparent text-gray-400 hover:text-slate-600")}>Shipping</button>
          </div>

          {/* TABS CONTENT */}
          <div className="min-h-[150px]">
            {activeTab === 'desc' && <p className="text-gray-600 leading-relaxed whitespace-pre-line animate-fade-in">{product.desc}</p>}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-2 gap-y-3 text-sm animate-fade-in">
                {specs.map((s, i) => (
                  <div key={i} className="contents">
                    <div className="text-gray-500">{s.label}</div>
                    <div className="font-medium text-slate-900">{s.value}</div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'ship' && (
              <div className="space-y-4 text-sm text-gray-600 animate-fade-in">
                <div className="flex items-center gap-3"><FaTruckFast className="text-slate-900 text-lg" /> Ships within 24 hours</div>
                <div className="flex items-center gap-3"><FaBox className="text-slate-900 text-lg" /> Secure industrial packaging</div>
                <div className="flex items-center gap-3"><FaRotateLeft className="text-slate-900 text-lg" /> 7-day return policy for defects</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 md:p-6 flex justify-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl p-4 w-full max-w-4xl pointer-events-auto flex items-center gap-3 md:gap-6">
          <button className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition flex items-center justify-center gap-2"><FaCommentDots /> Chat</button>
          <button className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition transform active:scale-95 flex items-center justify-center gap-2">Request Quote <FaPaperPlane /></button>
        </div>
      </div>
    </div>
  );
}