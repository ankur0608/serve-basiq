import { Metadata } from "next";
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import ServiceDetailView from '@/components/services/ServiceDetailView';
import { toOgImageUrl, OG_IMAGE_DIMENSIONS } from '@/lib/og-image';

interface Props {
  params: Promise<{ id: string }>;
}

// 🚀 1. Cache the database queries so we aren't hitting the DB on every single page load
const getCachedServiceData = unstable_cache(
  async (id: string) => {
    const rawService = await prisma.service.findUnique({
      where: { id },
      include: {
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
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
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

    if (!rawService) return null;

    const rawRelatedServices = await prisma.service.findMany({
      where: { categoryId: rawService.categoryId, id: { not: id } },
      take: 8,
      select: {
        id: true, name: true, price: true, priceType: true, coverImg: true,
        serviceimg: true, mainimg: true, serviceImages: true, gallery: true,
        category: { select: { name: true } },
        user: { select: { shopName: true } }
      }
    });

    return { rawService, rawRelatedServices };
  },
  ['service-detail-cache'],
  { revalidate: 60, tags: ['service'] } // Revalidates cache every 60 seconds
);

// Pre-render the most recently verified services at build time (ISR covers the rest on-demand)
export async function generateStaticParams() {
  const services = await prisma.service.findMany({
    where: { isVerified: true, user: { isVerified: true } },
    select: { id: true },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });
  return services.map((s) => ({ id: s.id }));
}

// 🚀 2. Add SEO Metadata for production sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getCachedServiceData(id);

  if (!data) return { title: "Service Not Found" };

  const { rawService } = data;
  const sellerName = rawService.user?.shopName || rawService.user?.name || "Servebasiq Provider";
  const rawMainImage = rawService.serviceimg || rawService.coverImg || rawService.mainimg;
  const ogImage = toOgImageUrl(rawMainImage);
  const description = rawService.desc?.substring(0, 160) || `Book ${rawService.name} from ${sellerName} on ServeBasiq.`;
  const canonical = `/services/${id}`;
  const title = `${rawService.name} by ${sellerName}`;

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
        alt: rawService.name,
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

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;

  // 🚀 3. Fetch Session and Cached Data in parallel
  const [session, data] = await Promise.all([
    getServerSession(authOptions),
    getCachedServiceData(id)
  ]);

  if (!data) return notFound();
  const { rawService, rawRelatedServices } = data;

  const relatedServices = rawRelatedServices.map(rs => ({
    ...rs,
    price: Number(rs.price),
  }));

  // SMART ADDRESS LOGIC
  const providerAddresses = rawService.user.addresses || [];
  const providerWorkAddr = providerAddresses.find(a => a.type === 'Work');
  const providerHomeAddr = providerAddresses.find(a => a.type === 'Home');
  const fallbackAddr = providerWorkAddr || providerHomeAddr || providerAddresses[0];
  const formatDate = (date: any) => {
    if (!date) return new Date().toISOString();
    return typeof date === 'string' ? date : date.toISOString();
  };
  // Data Mapping
  const service = {
    ...rawService,
    price: Number(rawService.price),
    rating: Number(rawService.rating),
    latitude: rawService.latitude ? Number(rawService.latitude) : 0,
    longitude: rawService.longitude ? Number(rawService.longitude) : 0,
    addressLine1: rawService.addressLine1 || fallbackAddr?.line1 || null,
    addressLine2: rawService.addressLine2 || fallbackAddr?.line2 || null,
    city: rawService.city || fallbackAddr?.city || null,
    state: rawService.state || fallbackAddr?.state || null,
    pincode: rawService.pincode || fallbackAddr?.pincode || null,
    landmark: fallbackAddr?.landmark || null,

    // ✅ Fix: Use formatDate helper to prevent toISOString() errors
    createdAt: formatDate(rawService.createdAt),
    updatedAt: formatDate(rawService.updatedAt),

    user: {
      ...rawService.user,
      instagramUrl: (rawService.user as any).instagramUrl || null,
      facebookUrl: (rawService.user as any).facebookUrl || null,
      youtubeUrl: (rawService.user as any).youtubeUrl || null,
      websiteUrl: (rawService.user as any).websiteUrl || null,
    },

    // ✅ Fix: Also handle dates inside the reviews array
    reviews: rawService.reviews.map(review => ({
      ...review,
      createdAt: formatDate(review.createdAt),
    }))
  };

  let loggedInUser = null;
  if (session?.user?.email) {
    const rawUser = await prisma.user.findUnique({
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

    if (rawUser) {
      loggedInUser = {
        ...rawUser,
        createdAt: formatDate(rawUser.createdAt),
        updatedAt: formatDate(rawUser.updatedAt),
      };
    }
  }

  const sellerName = rawService.user?.shopName || rawService.user?.name || "Servebasiq Provider";
  const mainImage = rawService.serviceimg || rawService.coverImg || rawService.mainimg;
  const serviceCity = service.city || undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: rawService.name,
    description: rawService.desc,
    ...(mainImage && { image: mainImage }),
    serviceType: rawService.category?.name,
    provider: {
      '@type': 'LocalBusiness',
      name: sellerName,
      ...(rawService.user?.phone && { telephone: rawService.user.phone }),
      ...(serviceCity && {
        address: {
          '@type': 'PostalAddress',
          addressLocality: serviceCity,
          ...(service.state && { addressRegion: service.state }),
          ...(service.pincode && { postalCode: service.pincode }),
          addressCountry: 'IN',
        },
      }),
    },
    ...(serviceCity && { areaServed: { '@type': 'City', name: serviceCity } }),
    offers: {
      '@type': 'Offer',
      price: Number(rawService.price),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    ...(Number(rawService.rating) > 0 && rawService.reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(rawService.rating),
        reviewCount: rawService.reviews.length,
      },
    }),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.servebasiq.in' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.servebasiq.in/services' },
      { '@type': 'ListItem', position: 3, name: rawService.name },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ServiceDetailView
        service={service as any}
        loggedInUser={loggedInUser}
        session={session}
        relatedServices={relatedServices}
        listingType="SERVICE"
      />
    </>
  );
}