"use client";

import dynamic from 'next/dynamic';
import { Session } from 'next-auth';
import ListingDetailView, { ListingData, RelatedListing } from '@/components/shared/ListingDetailView';
import { useListingPageData } from '@/app/hook/useListingPageData';

const BookingWrapper = dynamic(() => import('@/components/booking/BookingWrapper'), { ssr: false });

interface Props {
    service: any;
    loggedInUser: any;
    session: Session | null;
    relatedServices?: any[];
    listingType?: 'SERVICE' | 'PRODUCT' | 'RENTAL';
}

export default function ServiceDetailView({
    service,
    loggedInUser,
    session,
    relatedServices = [],
    listingType = 'SERVICE',
}: Props) {

    const displayName = service.user?.shopName || service.name;

    const { currentUser } = useListingPageData({
        itemId: service.id,
        listingType,
        initialUser: loggedInUser,
        session,
    });

    const bookingSlot = listingType === 'SERVICE' ? (
        <BookingWrapper
            serviceId={service.id}
            serviceName={displayName}
            price={service.price}
            priceType={service.priceType}
            currentUser={currentUser}
            userAddresses={currentUser?.addresses || []}
            type={listingType}
        />
    ) : null;

    const listing: ListingData = {
        ...service,
        // Service rating is a DB column (not computed from reviews)
        // Only show it if > 0 and there are actual reviews
        rating: service.reviews?.length > 0 && Number(service.rating) > 0
            ? Number(service.rating)
            : service.reviews?.length > 0
                ? service.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / service.reviews.length
                : null,
    };

    // ✅ priceType forwarded — QUOTE services show "Custom Quote" in slider
    const related: RelatedListing[] = relatedServices.map(s => ({
        id:           s.id,
        name:         s.name || s.user?.shopName || 'Service',
        price:        Number(s.price) || 0,
        priceType:    s.priceType,
        unit:         s.priceType?.toUpperCase() === 'HOURLY' ? 'hour' : 'fixed',
        productImage: s.serviceImages?.[0] || s.coverImg || s.serviceimg || s.mainimg || null,
        gallery:      Array.isArray(s.gallery) ? s.gallery : [],
        category:     s.category,
        listingType:  listingType as 'SERVICE' | 'PRODUCT' | 'RENTAL',
        ownerLocation: s.city || s.loc || 'Location not specified',
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