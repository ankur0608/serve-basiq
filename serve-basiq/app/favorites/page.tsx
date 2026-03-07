// app/favorites/page.tsx
import { Metadata } from 'next';
import FavoritesList from '@/components/FavoritesList/FavoritesList';

export const metadata: Metadata = {
    title: 'My Favorites | ServeBasiq',
    description: 'View your saved services, products, and rentals on ServeBasiq.',
};

export default function FavoritesPage() {
    return <FavoritesList />;
}