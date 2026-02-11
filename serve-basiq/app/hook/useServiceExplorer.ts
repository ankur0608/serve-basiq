'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ExplorerItem, CategoryData } from '@/components/services/explorer';

export function useServiceExplorer() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
    const [sortOption, setSortOption] = useState('');

    // --- Data Fetching ---
    const { data: currentUser } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => (await fetch('/api/user/profile')).json(),
        staleTime: 1000 * 60 * 5,
    });

    useQuery({
        queryKey: ['favorites', 'user'],
        queryFn: async () => {
            const res = await fetch('/api/user/favorites');
            if (!res.ok) return { services: [], products: [] };
            const data = await res.json();
            setFavorites(data.services || []);
            return data;
        },
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categories', 'service'],
        queryFn: async () => {
            const res = await fetch('/api/categories?type=SERVICE');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 60,
    });

    const { data: apiResponse, isLoading: servLoading } = useQuery({
        queryKey: ['services', 'explorer'],
        queryFn: async () => (await fetch('/api/provider/services?limit=100')).json(),
        staleTime: 1000 * 60 * 1,
    });

    // --- Processing ---
    const rawItems: ExplorerItem[] = useMemo(() => {
        if (!apiResponse?.services) return [];
        return apiResponse.services.map((item: any) => ({
            id: item.id,
            name: item.name,
            categoryId: item.category?.id,
            categoryName: item.category?.name || "General",
            subcategoryId: item.subcategory?.id,
            subcategoryName: item.subcategory?.name,
            price: Number(item.price) || 0,
            priceType: item.priceType || 'FIXED',
            rating: Number(item.rating) || 0,
            reviewCount: item._count?.reviews || 0,
            location: item.city || "Remote",
            image: item.serviceimg || item.mainimg || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
            type: 'Service'
        }));
    }, [apiResponse]);

    const uniqueLocations = useMemo(() =>
        [...new Set(rawItems.map(i => i.location).filter(Boolean))].sort(),
        [rawItems]);

    const availableCategories: CategoryData[] = categoriesData || [];

    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        const cat = availableCategories.find((c) => String(c.id) === String(selectedCategory));
        return cat ? cat.children : [];
    }, [selectedCategory, availableCategories]);

    const filteredItems = useMemo(() => {
        let result = rawItems.filter(item => {
            const matchesSearch = !searchTerm ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLocation = !selectedLocation || item.location === selectedLocation;
            const matchesCategory = !selectedCategory || String(item.categoryId) === String(selectedCategory);
            const matchesSubcategory = !selectedSubcategory || String(item.subcategoryId) === String(selectedSubcategory);
            return matchesSearch && matchesLocation && matchesCategory && matchesSubcategory;
        });

        if (sortOption === 'price_asc') result.sort((a, b) => a.price - b.price);
        else if (sortOption === 'price_desc') result.sort((a, b) => b.price - a.price);
        else if (sortOption === 'rating') result.sort((a, b) => b.rating - a.rating);
        else if (sortOption === 'popular') result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

        return result;
    }, [rawItems, searchTerm, selectedLocation, selectedCategory, selectedSubcategory, sortOption]);

    // --- Actions ---
    const toggleFav = async (e: React.MouseEvent, id: string, type: string) => {
        e.preventDefault(); e.stopPropagation();
        const isFav = favorites.includes(id);
        setFavorites(isFav ? favorites.filter(f => f !== id) : [...favorites, id]);
        try {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: id, type: type.toUpperCase() })
            });
        } catch (e) { console.error(e); }
    };

    const handleCategoryClick = (id: string) => {
        setSelectedCategory(prev => prev === id ? '' : id);
        setSelectedSubcategory('');
    };

    const resetFilters = () => {
        setSearchTerm(''); setSelectedLocation(''); setSelectedCategory('');
        setSelectedSubcategory(''); setSortOption(''); setShowMobileFilters(false);
        router.push('/services');
    };

    return {
        // State
        searchTerm, setSearchTerm,
        favorites,
        showMobileFilters, setShowMobileFilters,
        selectedLocation, setSelectedLocation,
        selectedCategory, setSelectedCategory,
        selectedSubcategory, setSelectedSubcategory,
        sortOption, setSortOption,

        // Data
        currentUser,
        availableCategories,
        availableSubcategories,
        uniqueLocations,
        filteredItems,
        isLoading: servLoading,

        // Handlers
        toggleFav,
        handleCategoryClick,
        resetFilters
    };
}