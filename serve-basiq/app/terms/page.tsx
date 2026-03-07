// app/terms/page.tsx
import { Metadata } from 'next';
import TermsContent from '@/components/TermsContent/TermsContent';

export const metadata: Metadata = {
    title: 'Terms & Conditions | ServeBasiq',
    description: 'Terms and Conditions for using ServeBasiq. Please read these terms carefully before using our platform.',
};

export default function TermsPage() {
    return <TermsContent />;
}