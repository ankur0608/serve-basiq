// app/privacy/page.tsx
import { Metadata } from 'next';
import PrivacyPolicyContent from '@/components/PrivacyPolicyContent/PrivacyPolicyContent';

export const metadata: Metadata = {
    title: 'Privacy Policy | ServeBasiq',
    description: 'Privacy Policy for ServeBasiq. Learn how we collect, use, and protect your information when you use our platform.',
};

export default function PrivacyPolicyPage() {
    return <PrivacyPolicyContent />;
}