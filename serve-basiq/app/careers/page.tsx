// app/careers/page.tsx
import { Metadata } from 'next';
import CareersContent from '@/components/Careers/CareersContent';

export const metadata: Metadata = {
    title: 'Careers at ServeBasiq | Nearby Services & Products',
    description: "Careers at ServeBasiq. We’re not hiring right now, but we’re always open to connecting with people who care about building useful products.",
};

export default function CareersPage() {
    return <CareersContent />;
}