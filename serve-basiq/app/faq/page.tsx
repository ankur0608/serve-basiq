// app/faq/page.tsx
import { Metadata } from 'next';
import FAQContent from '@/components/FAQContent/FAQContent';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions | ServeBasiq',
    description: 'Find answers to common questions about discovering services, booking, and selling on ServeBasiq.',
};

export default function FAQPage() {
    return <FAQContent />;
}