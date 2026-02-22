'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProducts } from '@/app/hook/useProducts';
import { X } from 'lucide-react';

// 🌟 Import your new reusable upload function!
import { uploadToBackend } from '@/lib/uploadToBackend';

// Import New 2-Step Components
import { Step1Details } from './Step1Info';
import { Step2Media } from './Step2Images';

// --- Shared Types ---
export interface SubCategory { id: string; name: string; }
export interface Category { id: string; name: string; children: SubCategory[]; }

export interface ProductForm {
    name: string;
    desc: string;
    categoryId: string;
    subCategoryId: string;
    productImage: string;
    gallery: string[];
    price: string;
    moq: string;
    stockStatus: string;
    unit: string;
    deliveryType: string;
}

interface AddProductProps {
    setActiveView: (view: string) => void;
    userId: string;
    showToast: (msg: string, type: 'success' | 'error') => void;
    editingProduct?: any;
}

export function AddProductView({ setActiveView, userId, showToast, editingProduct }: AddProductProps) {
    const { saveProduct, isSaving } = useProducts(userId);
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<'main' | 'gallery' | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [form, setForm] = useState<ProductForm>({
        name: editingProduct?.name || '',
        desc: editingProduct?.desc || '',
        categoryId: editingProduct?.categoryId || '',
        subCategoryId: editingProduct?.subCategoryId || editingProduct?.subcategory?.id || '',
        productImage: editingProduct?.productImage || editingProduct?.image || '',
        gallery: editingProduct?.gallery || [],
        price: editingProduct?.price ? String(editingProduct.price) : '',
        moq: editingProduct?.moq ? String(editingProduct.moq) : '1',
        stockStatus: editingProduct?.stockStatus || 'IN_STOCK',
        unit: editingProduct?.unit || 'PIECE',
        deliveryType: editingProduct?.deliveryType || 'DELIVERY'
    });

    // --- Fetch Categories ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories?type=PRODUCT');
                const data = await res.json();
                if (Array.isArray(data)) setCategories(data);
            } catch (error) {
                console.error("Failed to load categories");
                showToast("Failed to load categories", "error");
            }
        };
        fetchCategories();
    }, [showToast]);

    const activeSubCategories = useMemo(() => {
        const selectedCat = categories.find(c => c.id === form.categoryId);
        return selectedCat ? selectedCat.children : [];
    }, [categories, form.categoryId]);

    const handleChange = useCallback((field: keyof ProductForm, value: any) => {
        setForm(prev => {
            if (field === 'categoryId') {
                return { ...prev, [field]: value, subCategoryId: '' };
            }
            return { ...prev, [field]: value };
        });
    }, []);

    // 🚀 UPDATED: Uses uploadToBackend for the main image
    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, target: 'main') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setActiveUploadField(target);

        try {
            const url = await uploadToBackend(file);
            setForm(prev => ({ ...prev, productImage: url }));
            showToast("Main image uploaded!", "success");
        } catch (e) {
            console.error(e);
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
            setActiveUploadField(null);
        }
    }, [showToast]);

    // 🚀 UPDATED: Uses uploadToBackend for multiple gallery images/videos
    const handleGalleryUpload = useCallback(async (files: File[]) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setActiveUploadField('gallery');

        try {
            // Uploading all selected media concurrently
            const uploadPromises = files.map(file => uploadToBackend(file));
            const uploadedUrls = await Promise.all(uploadPromises);

            setForm(prev => ({
                ...prev,
                gallery: [...prev.gallery, ...uploadedUrls]
            }));

            showToast(`${uploadedUrls.length} items added to gallery`, "success");
        } catch (e) {
            console.error(e);
            showToast("One or more items failed to upload", "error");
        } finally {
            setUploading(false);
            setActiveUploadField(null);
        }
    }, [showToast]);

    const removeGalleryImg = useCallback((index: number) => {
        setForm(prev => {
            const newGallery = [...prev.gallery];
            newGallery.splice(index, 1);
            return { ...prev, gallery: newGallery };
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final validation before sending to the backend hook
        if (!form.productImage) {
            showToast("Main product image is required", "error");
            return;
        }

        const payload = {
            id: editingProduct?.id,
            ...form,
            price: parseFloat(form.price),
            moq: parseInt(form.moq),
        };

        try {
            await saveProduct(payload);
            showToast(editingProduct ? "Product Updated!" : "Product Created!", "success");
            setActiveView('products');
        } catch (error: any) {
            showToast(error.message || "Failed to save", "error");
        }
    };

    const closeForm = useCallback(() => setActiveView('products'), [setActiveView]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full mx-auto relative flex flex-col max-h-[90vh]">

                <button onClick={closeForm} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition">
                    <X size={24} />
                </button>

                <div className="bg-slate-900 p-6 text-white relative shrink-0">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-xl font-bold">
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </h2>
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">
                            Step {step} of 2
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(step / 2) * 100}%` }} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    {step === 1 && (
                        <Step1Details
                            form={form}
                            categories={categories}
                            activeSubCategories={activeSubCategories}
                            handleChange={handleChange}
                            setStep={setStep}
                            closeForm={closeForm}
                        />
                    )}

                    {step === 2 && (
                        <Step2Media
                            form={form}
                            uploading={uploading}
                            activeUploadField={activeUploadField}
                            handleImageUpload={handleImageUpload}
                            handleGalleryUpload={handleGalleryUpload}
                            removeGalleryImg={removeGalleryImg}
                            setStep={setStep}
                            isSaving={isSaving}
                            editingProduct={editingProduct}
                        />
                    )}
                </form>
            </div>
        </div>
    );
}