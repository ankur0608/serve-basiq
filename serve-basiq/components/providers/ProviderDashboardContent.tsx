// components/providers/ProviderDashboardContent.tsx
'use client';

import { DashboardHomeView } from '@/components/providers/GeneralViews'; // Adjust path if needed
import ProfileView from '@/components/providers/ProfileView';
import { AddProductView } from '@/components/providers/product/AddProductView';
import { ManagementView } from '@/components/providers/Management';
import { VerificationView } from '@/components/providers/VerificationView';
import RequestsView from '@/components/providers/RequestsView';
import { ProductsView } from '@/components/providers/ProductsView';

interface ContentProps {
    activeView: string;
    handleViewChange: (view: string) => void;
    handleBackToHome: () => void;
    safeStats: any;
    isVerified: boolean;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    providerType: string;
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
        isVerified, showToast, providerType, userData, currentUser,
        refetchDashboard, setSelectedProduct, selectedProduct,
        recentBookings, recentOrders, recentRentals // ✅ DESTRUCTURED HERE
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
                    providerType={providerType}
                    recentBookings={recentBookings}
                    recentOrders={recentOrders}
                    recentRentals={recentRentals} // ✅ PASSED TO HOME VIEW
                />
            )}

            {/* 2. Operations / Requests */}
            {activeView === 'requests' && (
                <RequestsView
                    showToast={showToast}
                    providerType={providerType}
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

            {/* 4. Service / Product Management (Parent View) */}
            {activeView === 'settings' && (
                providerType === 'PRODUCT' ? (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900">Inventory Management</h2>
                        {currentUser?.id && (
                            <ProductsView
                                setActiveView={handleViewChange}
                                userId={currentUser.id}
                                setSelectedProduct={setSelectedProduct}
                                showToast={showToast}
                                providerType={providerType}
                            />
                        )}
                    </div>
                ) : (
                    <ManagementView
                        currentUser={currentUser}
                        userData={userData}
                        showToast={showToast}
                        setActiveView={handleViewChange}
                        providerType={providerType}
                    />
                )
            )}

            {/* 5. Products Specific Tab (for Hybrid Providers) */}
            {activeView === 'products' && (
                <div className="space-y-6">
                    {currentUser?.id && (
                        <ProductsView
                            setActiveView={handleViewChange}
                            userId={currentUser.id}
                            setSelectedProduct={setSelectedProduct}
                            showToast={showToast}
                            providerType={providerType}
                        />
                    )}
                </div>
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