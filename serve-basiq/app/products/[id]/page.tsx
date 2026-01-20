import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  FaArrowLeft, FaRegHeart, FaBuilding, FaCircleCheck,
  FaTruckFast, FaBox, FaRotateLeft, FaCommentDots
} from 'react-icons/fa6';
import clsx from 'clsx';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductWrapper from '@/components/products/ProductWrapper';

// ✅ Force Next.js to not cache this page
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetail({ params }: Props) {

  // 1. Unwrap Params
  const { id } = await params;
  const productId = id;

  // 2. Fetch Product Data
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      // ✅ FIX: Include the Category relation to get the name
      category: {
        select: { name: true }
      },
      user: {
        select: {
          name: true,
          isVerified: true,
          shopName: true
        }
      }
    }
  });

  if (!product) return notFound();

  // 3. ✅ Fetch Current User (Full Object)
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  let loggedInUser = null;

  if (currentUserId) {
    loggedInUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { addresses: true } // Helper to get addresses easily
    });
  }

  // Helper Data
  const specs = [
    { label: "MOQ", value: `${product.moq} ${product.unit}` },
    // ✅ FIX: Access nested category name safely
    { label: "Category", value: product.category?.name || "General" },
    { label: "Warranty", value: "Standard Manufacturer" },
    { label: "Condition", value: "New" },
  ];

  const mainImage = product.productImage || "https://via.placeholder.com/500?text=No+Image";
  const galleryImages = (product.gallery && product.gallery.length > 0)
    ? product.gallery
    : [mainImage, mainImage, mainImage, mainImage];

  return (
    <div className="pb-32 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-8 md:gap-12">

        {/* --- LEFT: IMAGES --- */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-center justify-center relative h-[300px] md:h-[500px] group overflow-hidden">
            <img
              src={mainImage}
              alt={product.name}
              className="object-contain mix-blend-multiply relative z-10 hover:scale-110 transition duration-700 max-h-full"
            />

            <Link href="/products" className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-slate-900 z-20 transition">
              <FaArrowLeft />
            </Link>

            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 z-20 transition">
              <FaRegHeart />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {galleryImages.slice(0, 4).map((img, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 p-2 rounded-xl h-20 md:h-24 flex items-center justify-center cursor-pointer hover:border-blue-500 transition">
                <div className="relative w-full h-full">
                  <img src={img} alt="thumb" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT: DETAILS --- */}
        <div className="pt-4">
          <div className="flex justify-between items-start mb-4">
            <span className={clsx(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-2",
              product.stockStatus === 'IN_STOCK' ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"
            )}>
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
            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-2xl text-slate-400">
              <FaBuilding />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold">Supplier</div>
              <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
                {product.user?.shopName || product.user?.name || "Verified Seller"}
                {product.user?.isVerified && <FaCircleCheck className="text-blue-500 text-sm" />}
              </div>
            </div>
            <button className="ml-auto text-sm font-bold text-blue-600 hover:underline">View Profile</button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2 border-b border-gray-100 pb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{product.desc}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-2 border-b border-gray-100 pb-2">Specifications</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                {specs.map((s, i) => (
                  <div key={i} className="contents">
                    <div className="text-gray-500">{s.label}</div>
                    <div className="font-medium text-slate-900">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-bold text-slate-900 mb-3 text-sm">Shipping & Returns</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-3"><FaTruckFast className="text-slate-900" />
                  {product.deliveryType === 'PICKUP' ? "Available for Pickup" : "Ships within 24-48 hours"}
                </div>
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
          <button className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition flex items-center justify-center gap-2">
            <FaCommentDots /> Chat
          </button>

          {/* ✅ UPDATED WRAPPER WITH USER PROP */}
          <ProductWrapper
            productId={product.id}
            productName={product.name}
            productPrice={product.price}
            productUnit={product.unit}
            moq={product.moq}
            currentUser={loggedInUser} // 👈 Passes full object now
            userAddresses={loggedInUser?.addresses || []}
          />
        </div>
      </div>
    </div>
  );
}