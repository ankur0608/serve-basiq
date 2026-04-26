"use client";

import dynamic from 'next/dynamic';
import { Session } from 'next-auth';
import ListingDetailView, { ListingData, RelatedListing } from '@/components/shared/ListingDetailView';
import { useListingPageData } from '@/app/hook/useListingPageData';

const ProductWrapper = dynamic(() => import('@/components/products/ProductWrapper'), { ssr: false });

interface Props {
    product: any;
    loggedInUser: any;
    session: Session | null;
    relatedProducts?: any[];
    listingType: 'SERVICE' | 'PRODUCT' | 'RENTAL';
}

export default function ProductDetailContent({
    product,
    loggedInUser,
    session,
    relatedProducts = [],
    listingType,
}: Props) {

    const displayName = product?.user?.shopName || product?.user?.name || product?.name || 'Item';

    const { currentUser } = useListingPageData({
        itemId: product?.id,
        listingType,
        initialUser: loggedInUser,
        session,
    });

    const bookingSlot = (
        <ProductWrapper
            productId={product?.id}
            productName={displayName}
            productPrice={product?.price}
            priceType={product?.priceType}
            productUnit={product?.unit || 'PIECE'}
            moq={product?.moq || 1}
            currentUser={currentUser}
            userAddresses={currentUser?.addresses || []}
            type={listingType}
        />
    );

    const listing: ListingData = {
        ...product,
        // Products compute rating from reviews; treat 0 as null (no reviews yet)
        rating: product?.reviews?.length > 0
            ? product.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / product.reviews.length
            : null,
    };

    // ✅ priceType forwarded — QUOTE products show "Custom Quote" in slider
    const related: RelatedListing[] = relatedProducts.map(p => ({
        id:           p.id,
        name:         p.name || p.user?.shopName || 'Item',
        price:        Number(p.price) || 0,
        priceType:    p.priceType,
        unit:         p.priceType === 'HOURLY' ? 'hour' : 'fixed',
        productImage: p.serviceImages?.[0] || p.coverImg || p.serviceimg || p.mainimg || null,
        gallery:      Array.isArray(p.gallery) ? p.gallery : [],
        category:     p.category,
        listingType,
        ownerLocation: p.city || p.loc || 'Location not specified',
    }));

    return (
        <ListingDetailView
            listing={listing}
            relatedListings={related}
            session={session}
            loggedInUser={loggedInUser}
            listingType={listingType}
            bookingSlot={bookingSlot}
            requireLoginForContact
        />
    );
}