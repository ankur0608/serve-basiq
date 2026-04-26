// app/cancellations/page.tsx
import { Metadata } from 'next';
import CancelledBookingsList from '@/components/CancelledBookingsList/CancelledBookingsList';

export const metadata: Metadata = {
  title: 'Cancelled Bookings',
  robots: {
    index: false,
    follow: false, 
  },
};

export default function CancellationsPage() {
    return (
        <main>
            <CancelledBookingsList />
        </main>
    );
}