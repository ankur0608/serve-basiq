import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import ProductDetailContent from '@/components/products/ProductDetailContent';
import { toOgImageUrl, OG_IMAGE_DIMENSIONS } from '@/lib/og-image';

interface Props {
  params: Promise<{ id: string }>;
}

const getCachedProduct = unstable_cache(
  async (id: string) => {
    return await prisma.product.findUnique({
      where: { id },
      select: {
        id: true, name: true, desc: true, price: true, priceType: true,
        unit: true, moq: true, condition: true, deliveryType: true,
        stockStatus: true, productImage: true, productImages: true,
        gallery: true, isVerified: true, createdAt: true,
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        user: {
          select: {
            id: true, name: true, image: true, profileImage: true, isVerified: true,
            phone: true, shopName: true, instagramUrl: true, facebookUrl: true,
            youtubeUrl: true, websiteUrl: true,
            addresses: {
              select: {
                id: true, type: true, line1: true, line2: true, landmark: true,
                city: true, state: true, pincode: true,
              },
              take: 5,
            }
          }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true, rating: true, comment: true, images: true, createdAt: true,
            author: { select: { id: true, name: true, image: true } },
          }
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

// Pre-render the most recently verified products at build time (ISR covers the rest on-demand)
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isVerified: true, user: { isVerified: true } },
    select: { id: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const product = await getCachedProduct(id);

  if (!product) return { title: "Product Not Found" };

  const sellerName = product.user?.shopName || product.user?.name || "Servebasiq Provider";
  const description = product.desc?.substring(0, 160) || `Buy ${product.name} from ${sellerName} on ServeBasiq.`;
  const canonical = `/products/${id}`;
  const rawMainImage = product.productImage || product.productImages?.[0] || product.gallery?.[0];
  const ogImage = toOgImageUrl(rawMainImage);
  const title = `${product.name} by ${sellerName}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      images: [{
        url: ogImage,
        secureUrl: ogImage,
        type: 'image/jpeg',
        width: OG_IMAGE_DIMENSIONS.width,
        height: OG_IMAGE_DIMENSIONS.height,
        alt: product.name,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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
      include: {
        addresses: {
          select: {
            id: true, type: true, line1: true, line2: true, landmark: true,
            city: true, state: true, pincode: true,
          },
          take: 10,
        }
      }
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

    // ✅ FIX 1: Use the actual database priceType instead of hardcoding "FIXED"
    priceType: product.priceType || "FIXED",

    // ✅ FIX 2: Map these extra product fields so your UI stats grid shows real data!
    unit: product.unit || "PIECE",
    moq: product.moq || 1,
    condition: product.condition || "NEW",
    deliveryType: product.deliveryType || "DELIVERY",
    stockStatus: product.stockStatus || "IN_STOCK",

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

    reviews: product.reviews?.map((review: any) => ({
      ...review,
      createdAt: new Date(review.createdAt).toISOString(),
      updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null,
    })) || [],
  };

  const sellerName = product.user?.shopName || product.user?.name || "Servebasiq Provider";
  const mainImage = product.productImage || product.productImages?.[0] || product.gallery?.[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.desc,
    ...(mainImage && { image: mainImage }),
    ...(product.category?.name && { category: product.category.name }),
    brand: { '@type': 'Brand', name: sellerName },
    offers: {
      '@type': 'Offer',
      price: Number(product.price),
      priceCurrency: 'INR',
      availability:
        product.stockStatus === 'OUT_OF_STOCK'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      itemCondition:
        product.condition === 'USED'
          ? 'https://schema.org/UsedCondition'
          : 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: sellerName },
      url: `https://www.servebasiq.in/products/${id}`,
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(calculatedRating),
        reviewCount: product.reviews.length,
      },
    }),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.servebasiq.in' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.servebasiq.in/products' },
      { '@type': 'ListItem', position: 3, name: product.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ProductDetailContent
        product={mappedProduct as any}
        loggedInUser={loggedInUser}
        session={session}
        listingType="PRODUCT"
      />
    </>
  );
}