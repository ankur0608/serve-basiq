import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';

interface UseListingPageDataProps {
    itemId: string;
    listingType: 'SERVICE' | 'PRODUCT' | 'RENTAL';
    initialUser: any;
    session: Session | null;
}

export function useListingPageData({ itemId, listingType, initialUser, session }: UseListingPageDataProps) {

    const userQuery = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        initialData: initialUser,
        enabled: !!session,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const eligibilityQuery = useQuery({
        queryKey: ['review-eligibility', listingType, itemId],
        queryFn: async () => {
            // Dynamically choose the correct API endpoint based on what we are viewing
            const endpoint = listingType === 'PRODUCT'
                ? `/api/products/${itemId}/review-eligibility`
                : `/api/services/${itemId}/review-eligibility`;

            const res = await fetch(endpoint);
            if (!res.ok) return { canReview: false, reason: 'ERROR' };
            return res.json();
        },
        enabled: !!session,
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    return {
        currentUser: userQuery.data,
        eligibility: eligibilityQuery.data,
        isUserLoading: userQuery.isLoading,
        isEligibilityLoading: eligibilityQuery.isLoading,
    };
}