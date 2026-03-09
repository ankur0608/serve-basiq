import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import ProductDetailContent from '@/components/products/ProductDetailContent';

interface Props {
  params: Promise<{ id: string }>;
}

const getCachedProduct = unstable_cache(
  async (id: string) => {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            addresses: true
          }
        },
        category: true,
        subcategory: true,
        reviews: {
          include: { author: true },
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });
  },
  ['product-detail-cache'],
  {
    revalidate: 60,
    tags: ['product'],
  }
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const product = await getCachedProduct(id);

  if (!product) return { title: "Product Not Found | Servebasiq " };

  const sellerName = product.user?.shopName || product.user?.name || "Servebasiq Provider";

  return {
    title: `${product.name} by ${sellerName} | Servebasiq `,
    description: product.desc.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.desc.substring(0, 160),
      images: product.productImage ? [{ url: product.productImage }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const [session, product] = await Promise.all([
    getServerSession(authOptions),
    getCachedProduct(id)
  ]);

  if (!product) {
    return notFound();
  }

  let loggedInUser = null;
  if (session?.user?.email) {
    loggedInUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { addresses: true }
    });
  }

  const calculatedRating = product.reviews.length > 0
    ? (product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length).toFixed(1)
    : 5.0;

  const sellerAddress = product.user.addresses?.find(a => a.type === 'Work') || product.user.addresses?.[0];

  const mappedProduct = {
    id: product.id,
    name: product.name,
    desc: product.desc,
    price: product.price,
    priceType: "FIXED",
    coverImg: product.productImage,
    mainimg: product.productImage,
    serviceimg: product.productImage,
    serviceImages: product.productImages || [],
    gallery: product.gallery || [],
    rating: Number(calculatedRating),
    isVerified: product.isVerified,
    experience: null,
    radiusKm: null,
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

    // 🛠️ FIX: Map the reviews and safely parse the dates
    reviews: product.reviews?.map((review: any) => ({
      ...review,
      createdAt: new Date(review.createdAt).toISOString(),
      updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null,
    })) || [],
  };

  return (
    <ProductDetailContent
      service={mappedProduct as any}
      loggedInUser={loggedInUser}
      session={session}
      listingType="PRODUCT" // ✅ Let the client component know it's a product
    />
  );
}