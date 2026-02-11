import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';

interface UseServicePageDataProps {
    serviceId: string;
    initialUser: any;
    session: Session | null;
}

export function useServicePageData({ serviceId, initialUser, session }: UseServicePageDataProps) {

    // 1. User Profile Query
    const userQuery = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await fetch('/api/user/profile');
            if (!res.ok) return null;
            return res.json();
        },
        initialData: initialUser,
        enabled: !!session, // Only fetch if logged in
        staleTime: 1000 * 60 * 5, // 5 Minutes - Prevents immediate refetching
        refetchOnWindowFocus: false, // Prevents refetching when clicking between tabs
    });

    // 2. Review Eligibility Query
    const eligibilityQuery = useQuery({
        queryKey: ['review-eligibility', serviceId],
        queryFn: async () => {
            const res = await fetch(`/api/services/${serviceId}/review-eligibility`);
            if (!res.ok) return { canReview: false, reason: 'ERROR' };
            return res.json();
        },
        enabled: !!session,
        staleTime: 1000 * 60 * 5, // 5 Minutes
        refetchOnWindowFocus: false,
    });

    return {
        currentUser: userQuery.data,
        eligibility: eligibilityQuery.data,
        isUserLoading: userQuery.isLoading,
        isEligibilityLoading: eligibilityQuery.isLoading,
    };
}