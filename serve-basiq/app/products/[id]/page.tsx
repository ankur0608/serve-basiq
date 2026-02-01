import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  FaArrowLeft, FaRegHeart, FaBuilding, FaCircleCheck,
  FaTruckFast, FaBox, FaRotateLeft
} from 'react-icons/fa6';
import clsx from 'clsx';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductWrapper from '@/components/products/ProductWrapper';
import SupplierProfileModal from '@/components/products/SupplierProfileModal';
import { ImageOff } from 'lucide-react';

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;

  // Direct Database Call (Most efficient - No API needed)
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      user: {
        select: {
          id: true, name: true, shopName: true, email: true, phone: true,
          isVerified: true, image: true, profileImage: true, createdAt: true,
          instagramUrl: true, facebookUrl: true, websiteUrl: true, youtubeUrl: true,
          addresses: { where: { type: "Work" }, take: 1, select: { city: true, state: true, country: true } }
        }
      }
    }
  });

  if (!product) return notFound();

  const session = await getServerSession(authOptions);

  let loggedInUser = null;
  if (session?.user?.id) {
    loggedInUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { addresses: true }
    });
  }

  // Helper Logic
  const mainImage = product.productImage || null;
  const galleryImages = (product.gallery && product.gallery.length > 0) ? product.gallery : [];
  if (mainImage && galleryImages.length === 0) galleryImages.push(mainImage);

  const supplierName = product.user?.shopName || product.user?.name || "Verified Seller";
  const supplierImage = product.user?.profileImage || product.user?.image;

  return (
    <div className="pb-32 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-8 md:gap-12">

        {/* --- LEFT: IMAGES --- */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-center justify-center relative h-[300px] md:h-[500px] group overflow-hidden">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="object-contain mix-blend-multiply relative z-10 hover:scale-110 transition duration-700 max-h-full" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <ImageOff size={48} />
                <span className="text-sm mt-2 font-medium">No Image Available</span>
              </div>
            )}

            <Link href="/products" className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-slate-900 z-20 transition"><FaArrowLeft /></Link>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 z-20 transition"><FaRegHeart /></button>
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.slice(0, 4).map((img, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 p-2 rounded-xl h-20 md:h-24 flex items-center justify-center cursor-pointer hover:border-blue-500 transition overflow-hidden">
                  <img src={img} alt={`View ${i}`} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- RIGHT: DETAILS --- */}
        <div className="pt-4">
          {/* ... (Existing Details code remains the same as it is purely presentation) ... */}
          <div className="flex justify-between items-start mb-4">
            <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-2", product.stockStatus === 'IN_STOCK' ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200")}>
              <span className={clsx("w-2 h-2 rounded-full animate-pulse", product.stockStatus === 'IN_STOCK' ? "bg-green-600" : "bg-amber-600")}></span>
              {product.stockStatus === 'IN_STOCK' ? "In Stock" : "On Demand"}
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">{product.name}</h1>

          <div className="flex items-end gap-2 mb-8">
            <div className="text-4xl font-extrabold text-slate-900">₹{product.price}</div>
            <span className="text-gray-500 text-base mb-1.5 font-medium">/ {product.unit} (excl. GST)</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
              {supplierImage ? <img src={supplierImage} alt={supplierName} className="w-full h-full object-cover" /> : <FaBuilding className="text-2xl text-slate-400" />}
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold">Supplier</div>
              <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                {supplierName}
                {product.user?.isVerified && <FaCircleCheck className="text-blue-500 text-sm" />}
              </div>
            </div>
            <SupplierProfileModal supplier={product.user} />
          </div>

          {/* Details & Specs */}
          <div className="space-y-6">
            <div><h3 className="font-bold text-slate-900 mb-2 border-b border-gray-100 pb-2">Description</h3><p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{product.desc}</p></div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-bold text-slate-900 mb-3 text-sm">Shipping & Returns</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3"><FaTruckFast className="text-slate-900" />{product.deliveryType === 'PICKUP' ? "Available for Pickup" : "Ships within 24-48 hours"}</div>
                <div className="flex items-center gap-3"><FaBox className="text-slate-900" /> Secure industrial packaging</div>
                <div className="flex items-center gap-3"><FaRotateLeft className="text-slate-900" /> 7-day return policy for defects</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 md:p-6 flex justify-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-4 w-full max-w-4xl pointer-events-auto flex items-center gap-3 md:gap-6">
          <ProductWrapper
            productId={product.id}
            productName={product.name}
            productPrice={Number(product.price)}
            productUnit={product.unit}
            moq={Number(product.moq)}
            currentUser={loggedInUser}
            userAddresses={loggedInUser?.addresses || []}
          />
        </div>
      </div>
    </div>
  );
}