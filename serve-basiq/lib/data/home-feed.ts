import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

// unstable_cache caches the database query across multiple requests.
// It will automatically refresh the data in the background based on the 'revalidate' time.
export const getHomeFeaturedData = unstable_cache(
    async () => {
        try {
            // Run all three queries concurrently for maximum performance
            const [servicesData, rentalsData, productsData] = await Promise.all([
                // 1. Fetch Services
                prisma.service.findMany({
                    take: 4,
                    orderBy: { rating: 'desc' },
                    where: { isVerified: true, user: { isVerified: true } },
                    select: {
                        id: true, name: true, price: true, priceType: true, city: true, state: true, loc: true,
                        coverImg: true, serviceimg: true, mainimg: true, gallery: true, rating: true,
                        category: { select: { name: true } },
                        subcategory: { select: { name: true } },
                        user: { select: { name: true, image: true, profileImage: true, shopName: true } }
                    }
                }),
                // 2. Fetch Rentals
                prisma.rental.findMany({
                    take: 4,
                    orderBy: { createdAt: 'desc' },
                    where: { isVerified: true },
                    select: {
                        id: true, name: true, price: true, priceType: true, dailyPrice: true, monthlyPrice: true, fixedPrice: true,
                        addressLine1: true, addressLine2: true, city: true, state: true, pincode: true,
                        rentalImg: true, coverImg: true, gallery: true,
                        category: { select: { name: true } },
                    }
                }),
                // 3. Fetch Products
                prisma.product.findMany({
                    take: 4,
                    orderBy: { createdAt: 'desc' },
                    where: { isVerified: true, user: { isVerified: true } },
                    select: {
                        id: true, name: true, price: true, productImage: true, gallery: true,
                        category: { select: { name: true } },
                        user: { select: { name: true, shopName: true } }
                    }
                })
            ]);

            // Map the results cleanly
            const services = servicesData.map(service => ({
                id: service.id,
                name: service.name,
                categoryName: service.category?.name || "General Service",
                subcategoryName: service.subcategory?.name,
                price: Number(service.price) || 0,
                priceType: service.priceType || 'FIXED',
                location: service.city ? `${service.city}${service.state ? `, ${service.state}` : ''}` : (service.loc || "India"),
                image: service.coverImg || service.serviceimg || service.mainimg || service.gallery?.[0] || service.user?.profileImage || service.user?.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
                rating: Number(service.rating) || 5.0,
                type: 'Service'
            }));

            const rentals = rentalsData.map(rental => ({
                id: rental.id,
                name: rental.name,
                categoryName: rental.category?.name || "General Rental",
                image: rental.coverImg || rental.rentalImg || rental.gallery?.[0] || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80",
                location: rental.city ? `${rental.city}${rental.state ? `, ${rental.state}` : ''}` : "India",
                rating: 5.0,
                price: Number(rental.price) || 0,
                priceType: rental.priceType || 'DAILY',
                dailyPrice: rental.dailyPrice ? Number(rental.dailyPrice) : null,
                monthlyPrice: rental.monthlyPrice ? Number(rental.monthlyPrice) : null,
                fixedPrice: rental.fixedPrice ? Number(rental.fixedPrice) : null,
                addressLine1: rental.addressLine1 || undefined,
                addressLine2: rental.addressLine2 || undefined,
                city: rental.city || undefined,
                state: rental.state || undefined,
                pincode: rental.pincode || undefined,
            }));

            const products = productsData.map(product => ({
                ...product,
                image: product.productImage || (product.gallery?.[0]) || "/placeholder-product.webp",
                category: product.category?.name || "General",
                supplier: product.user?.shopName || product.user?.name || "Verified Seller",
            }));

            return { services, rentals, products };

        } catch (error) {
            console.error("[getHomeFeaturedData] Failed to fetch home data:", error);
            return { services: [], rentals: [], products: [] };
        }
    },
    ['home-featured-data-key'], // A unique key for this cache
    {
        revalidate: 3600, // Revalidates the cache every 3600 seconds (1 hour). Change to 60 for 1 minute.
        tags: ['home-feed'] // Allows us to manually purge this cache instantly on demand
    }
);