// app/products/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProductDetailContent from '@/components/products/ProductDetailContent';

// Ensure the page renders dynamically to handle real-time session state
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

// 1. 🚀 PRODUCTION FEATURE: Dynamic SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, desc: true, productImage: true, user: { select: { shopName: true, name: true } } }
  });

  if (!product) return { title: "Product Not Found | ServeMate" };

  const sellerName = product.user?.shopName || product.user?.name || "ServeMate Provider";

  return {
    title: `${product.name} by ${sellerName} | ServeMate`,
    description: product.desc.substring(0, 160), // Truncate for SEO optimal length
    openGraph: {
      title: product.name,
      description: product.desc.substring(0, 160),
      images: product.productImage ? [{ url: product.productImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  // 2. 🚀 PRODUCTION FEATURE: Parallel Fetching
  // Fetch session and product at the same time to reduce page load time
  const [session, product] = await Promise.all([
    getServerSession(authOptions),
    prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            addresses: true // ✅ Fetch user's location via Address model
          }
        },
        category: true,
        subcategory: true,
        reviews: {
          include: { author: true },
          orderBy: { createdAt: "desc" }
        }
      }
    })
  ]);

  // 3. Graceful Error Handling
  if (!product) {
    return notFound();
  }

  // Fetch logged-in user details if session exists
  let loggedInUser = null;
  if (session?.user?.email) {
    loggedInUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { addresses: true }
    });
  }

  // 4. 🚀 PRODUCTION FEATURE: Dynamic Rating Calculation
  const calculatedRating = product.reviews.length > 0
    ? (product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length).toFixed(1)
    : 5.0; // Default to 5.0 for new items

  // ✅ Find the seller's primary address (Preferably their 'Work' or shop address, fallback to the first one)
  const sellerAddress = product.user.addresses?.find(a => a.type === 'Work') || product.user.addresses?.[0];

  // 5. 🚀 PRODUCTION FEATURE: Safe Type Mapping
  // Map Prisma Product model to the ServiceDetailViewProps interface seamlessly
  const mappedProduct = {
    id: product.id,
    name: product.name,
    desc: product.desc,
    price: product.price,
    priceType: "FIXED", // Products are usually fixed price

    // Safely map image arrays
    coverImg: product.productImage,
    mainimg: product.productImage,
    serviceimg: product.productImage,
    serviceImages: product.productImages || [],
    gallery: product.gallery || [],

    rating: Number(calculatedRating),
    isVerified: product.isVerified,
    experience: null, // Not applicable for physical products
    radiusKm: null,

    // ✅ Updated: Read from the sellerAddress we extracted above
    city: sellerAddress?.city || null,
    state: sellerAddress?.state || null,
    pincode: sellerAddress?.pincode || null,

    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    is24x7: true,

    user: {
      id: product.user.id,
      name: product.user.name,
      image: product.user.image,
      profileImage: product.user.profileImage,
      phone: product.user.phone,
      shopName: product.user.shopName,
      isVerified: product.user.isVerified,
      instagramUrl: product.user.instagramUrl,
      facebookUrl: product.user.facebookUrl,
      youtubeUrl: product.user.youtubeUrl,
      websiteUrl: product.user.websiteUrl,
    },

    category: product.category ? { name: product.category.name } : null,
    subcategory: product.subcategory ? { name: product.subcategory.name } : null,
    reviews: product.reviews || [],
  };

  return (
    <ProductDetailContent
      // We cast to `any` here strictly because we are adapting a Product model 
      // into a component originally built for a Service model.
      service={mappedProduct as any}
      loggedInUser={loggedInUser}
      session={session}
    />
  );
}