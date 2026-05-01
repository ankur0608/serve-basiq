// components/providers/ProviderDashboardContent.tsx
'use client';

import { DashboardHomeView } from '@/components/providers/GeneralViews'; // Adjust path if needed
import ProfileView from '@/components/providers/ProfileView';
import { AddProductView } from '@/components/providers/product/AddProductView';
import { UnifiedManagementView } from '@/components/providers/UnifiedManagement';
import { VerificationView } from '@/components/providers/VerificationView';
import RequestsView from '@/components/providers/RequestsView';

interface ContentProps {
    activeView: string;
    handleViewChange: (view: string) => void;
    handleBackToHome: () => void;
    safeStats: any;
    isVerified: boolean;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    userData: any;
    currentUser: any;
    refetchDashboard: () => void;
    setSelectedProduct: (p: any) => void;
    selectedProduct: any;
    recentBookings: any[];
    recentOrders: any[];
    recentRentals: any[]; // ✅ ADDED THIS LINE
}

export function ProviderDashboardContent(props: ContentProps) {
    const {
        activeView, handleViewChange, handleBackToHome, safeStats,
        isVerified, showToast, userData, currentUser,
        refetchDashboard, setSelectedProduct, selectedProduct,
        recentBookings, recentOrders, recentRentals
    } = props;

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Dashboard Home */}
            {activeView === 'dashboard' && (
                <DashboardHomeView
                    stats={{ stats: safeStats }}
                    setActiveView={handleViewChange}
                    onBackToHome={handleBackToHome}
                    isVerified={isVerified}
                    recentBookings={recentBookings}
                    recentOrders={recentOrders}
                    recentRentals={recentRentals}
                />
            )}

            {/* 2. Operations / Requests */}
            {activeView === 'requests' && (
                <RequestsView
                    showToast={showToast}
                />
            )}

            {/* 3. Account Profile */}
            {activeView === 'profile' && (
                <ProfileView
                    stats={safeStats}
                    user={userData}
                    onEdit={() => handleViewChange('edit-profile')}
                />
            )}

            {/* 4. Unified Listing Management (Services / Rentals / Products) */}
            {(activeView === 'settings' || activeView === 'rentals' || activeView === 'products') && (
                <UnifiedManagementView
                    currentUser={currentUser}
                    userData={userData}
                    showToast={showToast}
                    setActiveView={handleViewChange}
                    setSelectedProduct={setSelectedProduct}
                    initialTab={
                        activeView === 'rentals' ? 'RENTAL'
                            : activeView === 'products' ? 'PRODUCT'
                                : 'SERVICE'
                    }
                />
            )}

            {/* 6. Verification / Edit Profile */}
            {activeView === 'edit-profile' && (
                <VerificationView
                    userId={currentUser?.id || ""}
                    existingData={userData}
                    showToast={showToast}
                    onBack={() => {
                        refetchDashboard();
                        handleViewChange('profile');
                    }}
                />
            )}

            {/* 7. Add/Edit Product Form */}
            {activeView === 'add-product' && currentUser?.id && (
                <AddProductView
                    setActiveView={handleViewChange}
                    userId={currentUser.id}
                    showToast={showToast}
                    editingProduct={selectedProduct}
                />
            )}
        </div>
    );
}