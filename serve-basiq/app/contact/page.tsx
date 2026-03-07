// app/contact/page.tsx
import { Metadata } from 'next';
import ContactContent from '@/components/Contact/ContactContent';

export const metadata: Metadata = {
    title: 'Contact ServeBasiq | Nearby Services & Products',
    description: 'Contact ServeBasiq for questions about nearby services and products. We usually respond within 24 hours.',
};

export default function ContactPage() {
    return <ContactContent />;
}