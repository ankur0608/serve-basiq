'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useProducts } from '@/app/hook/useProducts';
import { X } from 'lucide-react';
import { uploadToBackend } from '@/lib/uploadToBackend';
import imageCompression from 'browser-image-compression';
import { Step1Details } from './Step1Info';
import { Step2Media } from './Step2Images';

export interface SubCategory { id: string; name: string; }
export interface Category { id: string; name: string; children: SubCategory[]; }

export interface ProductForm {
    name: string;
    desc: string;
    categoryId: string;
    subCategoryId: string;
    customCategoryName: string;
    productImage: string;
    productImages: string[];
    gallery: string[];
    priceType: string; 
    price: string;
    moq: string;
    stockStatus: string;
    unit: string;
    deliveryType: string;
    condition: string;
}

interface AddProductProps {
    setActiveView: (view: string) => void;
    userId: string;
    showToast: (msg: string, type: 'success' | 'error') => void;
    editingProduct?: any;
}

// ✅ Image Compression Settings: Targets ~500KB for high-quality product photos
const PRODUCT_IMAGE_COMPRESSION = {
    maxSizeMB: 0.5,           // Targets a max of 500 KB
    maxWidthOrHeight: 1920,   // Keeps images very sharp
    useWebWorker: true,
    fileType: "image/webp" as const,
    initialQuality: 0.85      // High initial quality to keep it around the 350-500kb sweet spot
};

const MAX_VIDEO_SIZE_MB = 50; // Strict limit for frontend video uploads

export function AddProductView({ setActiveView, userId, showToast, editingProduct }: AddProductProps) {
    const { saveProduct, isSaving } = useProducts(userId);
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [activeUploadField, setActiveUploadField] = useState<'main' | 'productImages' | 'gallery' | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [form, setForm] = useState<ProductForm>(() => {
        const isCustom = !!editingProduct?.customCategory;

        return {
            name: editingProduct?.name || '',
            desc: editingProduct?.desc || '',
            categoryId: isCustom ? 'OTHER' : (editingProduct?.categoryId || ''),
            subCategoryId: editingProduct?.subCategoryId || editingProduct?.subcategory?.id || '',
            customCategoryName: editingProduct?.customCategory || '',
            productImage: editingProduct?.productImage || '',
            productImages: editingProduct?.productImages || [],
            gallery: editingProduct?.gallery || [],
            priceType: editingProduct?.priceType || 'FIXED', 
            price: editingProduct?.price ? String(editingProduct.price) : '',
            moq: editingProduct?.moq ? String(editingProduct.moq) : '1',
            stockStatus: editingProduct?.stockStatus || 'IN_STOCK',
            unit: editingProduct?.unit || 'PIECE',
            deliveryType: editingProduct?.deliveryType || 'DELIVERY',
            condition: editingProduct?.condition || 'NEW'
        };
    });

    useEffect(() => {
        let isMounted = true;
        const fetchCategories = async () => {
            if (categories.length > 0) return;
            try {
                const res = await fetch('/api/categories?type=PRODUCT');
                const data = await res.json();
                if (isMounted && Array.isArray(data)) setCategories(data);
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchCategories();
        return () => { isMounted = false; };
    }, [categories.length]);

    const activeSubCategories = useMemo(() => {
        const selectedCat = categories.find(c => c.id === form.categoryId);
        return selectedCat ? selectedCat.children : [];
    }, [categories, form.categoryId]);

    const handleChange = useCallback((field: keyof ProductForm, value: any) => {
        setForm(prev => {
            if (field === 'categoryId') return { ...prev, [field]: value, subCategoryId: '' };
            return { ...prev, [field]: value };
        });
    }, []);

    // ✅ Unified Media Processor: Compresses images to WebP, limits video sizes
    const processAndUploadMedia = async (file: File): Promise<string> => {
        if (file.type.startsWith('image/')) {
            const compressedBlob = await imageCompression(file, PRODUCT_IMAGE_COMPRESSION);
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([compressedBlob], newFileName, { type: 'image/webp' });
            return await uploadToBackend(webpFile, "products");
        } 
        
        if (file.type.startsWith('video/')) {
            if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
                throw new Error(`Video exceeds the ${MAX_VIDEO_SIZE_MB}MB limit.`);
            }
            return await uploadToBackend(file, "products");
        }

        throw new Error("Unsupported file type.");
    };

    const handleMainImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setActiveUploadField('main');

        try {
            const url = await processAndUploadMedia(file);
            setForm(prev => ({ ...prev, productImage: url }));
            showToast("Main image uploaded successfully!", "success");
        } catch (error: any) {
            showToast(error.message || "Upload failed", "error");
        } finally {
            setUploading(false);
            setActiveUploadField(null);
        }
    }, [showToast]);

    const handleProductImagesUpload = useCallback(async (files: File[]) => {
        if (!files || files.length === 0) return;
        if (form.productImages.length + files.length > 5) {
            showToast("You can only add up to 5 product images", "error");
            return;
        }

        setUploading(true);
        setActiveUploadField('productImages');

        try {
            const uploadPromises = files.map(file => processAndUploadMedia(file));
            const uploadedUrls = await Promise.all(uploadPromises);
            setForm(prev => ({ ...prev, productImages: [...prev.productImages, ...uploadedUrls].slice(0, 5) }));
            showToast(`${uploadedUrls.length} product images uploaded!`, "success");
        } catch (error: any) {
            showToast(error.message || "Upload failed", "error");
        } finally {
            setUploading(false);
            setActiveUploadField(null);
        }
    }, [form.productImages.length, showToast]);

    const removeProductImage = useCallback((index: number) => {
        setForm(prev => {
            const newImages = [...prev.productImages];
            newImages.splice(index, 1);
            return { ...prev, productImages: newImages };
        });
    }, []);

    const handleGalleryUpload = useCallback(async (files: File[]) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setActiveUploadField('gallery');

        try {
            const uploadPromises = files.map(file => processAndUploadMedia(file));
            const uploadedUrls = await Promise.all(uploadPromises);
            setForm(prev => ({ ...prev, gallery: [...prev.gallery, ...uploadedUrls] }));
            showToast(`${uploadedUrls.length} items added to gallery`, "success");
        } catch (error: any) {
            showToast(error.message || "One or more items failed to upload", "error");
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

        if (!form.productImage) {
            showToast("Main Product Image is required", "error");
            return;
        }

        const payload = {
            id: editingProduct?.id,
            ...form,
            subCategoryId: (form.categoryId === 'OTHER' || form.subCategoryId === 'OTHER') ? '' : form.subCategoryId,
            customCategoryName: (form.categoryId === 'OTHER' || form.subCategoryId === 'OTHER') ? form.customCategoryName : undefined,
            priceType: form.priceType, 
            price: form.priceType === 'QUOTE' ? 0 : parseFloat(form.price), 
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
                        <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-slate-300">Step {step} of 2</span>
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
                            handleMainImageUpload={handleMainImageUpload}
                            handleProductImagesUpload={handleProductImagesUpload}
                            removeProductImage={removeProductImage}
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