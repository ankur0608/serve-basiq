"use client";

import dynamic from 'next/dynamic';
import { Session } from 'next-auth';
import ListingDetailView, { ListingData, RelatedListing } from '@/components/shared/ListingDetailView';
import { useListingPageData } from '@/app/hook/useListingPageData';

const RentalBookingWrapper = dynamic(() => import('@/components/Rental/RentalBookingWrapper'), { ssr: false });

interface Props {
    rental: any;
    relatedRentals: any[];
    session: Session | null;
    loggedInUser: any;
}

export default function RentalDetailsContent({ rental, relatedRentals, session, loggedInUser }: Props) {

    const { currentUser } = useListingPageData({
        itemId: rental.id,
        listingType: 'RENTAL',
        initialUser: loggedInUser,
        session,
    });

    const addressParts = [rental.addressLine1, rental.addressLine2, rental.city, rental.state].filter(Boolean);
    let fullAddress = addressParts.join(', ');
    if (rental.pincode) fullAddress += ` - ${rental.pincode}`;
    if (!fullAddress) fullAddress = 'Location available upon booking';

    const mainImg =
        rental.coverImg || rental.rentalImg || rental.mainimg ||
        (Array.isArray(rental.gallery) && rental.gallery[0]) ||
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2071&auto=format&fit=crop';

    const bookingSlot = (
        <RentalBookingWrapper
            rentalId={rental.id}
            rentalName={rental.name}
            rentalImage={mainImg}
            ownerLocation={fullAddress}
            price={rental.price}
            priceType={rental.priceType}
            hourlyPrice={rental.hourlyPrice}
            dailyPrice={rental.dailyPrice}
            weeklyPrice={rental.weeklyPrice}
            monthlyPrice={rental.monthlyPrice}
            fixedPrice={rental.fixedPrice}
            isAvailable={rental.isAvailable ?? true}
            currentUser={currentUser}
            userAddresses={currentUser?.addresses || []}
        />
    );

    const listing: ListingData = {
        ...rental,
        rating: rental.reviews?.length > 0
            ? rental.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / rental.reviews.length
            : null,
    };

    // ✅ priceType forwarded — QUOTE rentals show "Custom Quote" in slider
    const related: RelatedListing[] = relatedRentals.map(r => ({
        id:           r.id,
        name:         r.name,
        price:        Number(r.price) || 0,
        priceType:    r.priceType,
        unit:         r.priceType?.toLowerCase() || 'day',
        productImage: r.coverImg || r.rentalImg || null,
        gallery:      Array.isArray(r.gallery) ? r.gallery : [],
        category:     r.category,
        listingType:  'RENTAL' as const,
    }));

    return (
        <ListingDetailView
            listing={listing}
            relatedListings={related}
            session={session}
            loggedInUser={loggedInUser}
            listingType="RENTAL"
            bookingSlot={bookingSlot}
            requireLoginForContact
        />
    );
}