import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';

interface UseProductDataProps {
    productId: string;
    initialUser: any;
    session: Session | null;
}

export function useProductPageData({ productId, initialUser, session }: UseProductDataProps) {

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

    // 2. Review Eligibility
    const eligibilityQuery = useQuery({
        queryKey: ['product-review-eligibility', productId],
        queryFn: async () => {
            const res = await fetch(`/api/products/${productId}/review-eligibility`);
            if (!res.ok) return { canReview: false, reason: 'ERROR' };
            return res.json();
        },
        enabled: !!session,
        staleTime: 0, 
        refetchOnWindowFocus: false,
    });

    return {
        currentUser: userQuery.data,
        eligibility: eligibilityQuery.data,
        isEligibilityLoading: eligibilityQuery.isLoading,
    };
}