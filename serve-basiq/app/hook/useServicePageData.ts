import { useQuery } from '@tanstack/react-query';
import { Session } from 'next-auth';

interface UseServicePageDataProps {
    serviceId: string;
    initialUser: any;
    session: Session | null;
}

export function useServicePageData({ serviceId, initialUser, session }: UseServicePageDataProps) {

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
        queryKey: ['review-eligibility', serviceId],
        queryFn: async () => {
            const res = await fetch(`/api/services/${serviceId}/review-eligibility`);
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