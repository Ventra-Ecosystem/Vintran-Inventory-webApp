'use client';

import { useState } from 'react';
import { ProductHeader } from '@/src/components/dashboard/ProductHeader';
import { CatalogueTab } from '@/src/features/product/CatalogueTab';
import { AddProductTab } from '@/src/features/product/AddProductTab';
import { AddProductForm } from '@/src/features/product/AddProductForm';
import { BulkUploadTab } from '@/src/features/product/BulkUploadTab';
import { CategoriesTab } from '@/src/features/product/CategoriesTab';
import { AlertsTab } from '@/src/features/product/AlertsTab';
import { ProductDetail } from '@/src/features/product/ProductDetails';
import { ProductCatalogueScreen } from '@/src/features/product/ProductCatalogueScreen';
import { cn } from '@/src/lib/utils';

type SubScreen =
  | { type: 'productDetail'; productId: string }
  | { type: 'editProduct'; productId: string }
  | { type: 'addProduct' }
  | { type: 'productCatalogue' };

const TABS = ['Catalogue', 'Add product', 'Bulk upload', 'Categories', 'Alerts'] as const;
type TabType = (typeof TABS)[number];

function getHeaderTitle(tab: TabType, topScreen: SubScreen | null): string {
  if (topScreen?.type === 'productDetail') return 'Product detail';
  if (topScreen?.type === 'editProduct') return 'Edit Product';
  if (topScreen?.type === 'addProduct') return 'Add Product';
  if (topScreen?.type === 'productCatalogue') return 'Product Catalogue';
  if (tab === 'Catalogue') return 'Product Management';
  if (tab === 'Add product') return 'Add Product';
  if (tab === 'Bulk upload') return 'Bulk Upload';
  if (tab === 'Categories') return 'Categories';
  return 'Product Management';
}

export default function ProductPage() {
  const [tab, setTab] = useState<TabType>('Catalogue');
  const [screenStack, setScreenStack] = useState<SubScreen[]>([]);

  const topScreen = screenStack.length > 0 ? screenStack[screenStack.length - 1] : null;

  const push = (screen: SubScreen) => setScreenStack((s) => [...s, screen]);
  const pop = () => setScreenStack((s) => s.slice(0, -1));
  const clearStack = () => setScreenStack([]);

  const handleBack = () => {
    if (screenStack.length > 0) {
      pop();
      return;
    }
    setTab('Catalogue');
  };

  const switchTab = (t: TabType) => {
    clearStack();
    setTab(t);
  };

  const renderContent = () => {
    if (topScreen?.type === 'productCatalogue') {
      return <ProductCatalogueScreen onProductPress={(id) => push({ type: 'productDetail', productId: id })} />;
    }
    if (topScreen?.type === 'productDetail') {
      return (
        <ProductDetail
          product={{ id: topScreen.productId }}
          onEdit={() => push({ type: 'editProduct', productId: topScreen.productId })}
          onDeleted={pop}
        />
      );
    }
    if (topScreen?.type === 'editProduct') {
      return (
        <AddProductForm
          editProductId={topScreen.productId}
          saveLabel="Save changes"
          onSave={() => clearStack()}
        />
      );
    }
    if (topScreen?.type === 'addProduct') {
      return (
        <AddProductForm
          onSave={() => clearStack()}
        />
      );
    }

    switch (tab) {
      case 'Catalogue':
        return (
          <CatalogueTab
            onProductPress={(id) => push({ type: 'productDetail', productId: id })}
            onAddProduct={() => push({ type: 'addProduct' })}
            onViewAll={() => push({ type: 'productCatalogue' })}
          />
        );
      case 'Add product':
        return (
          <AddProductTab
            onAddNew={() => push({ type: 'addProduct' })}
            onGoToCategories={() => switchTab('Categories')}
          />
        );
      case 'Bulk upload':
        return <BulkUploadTab />;
      case 'Categories':
        return <CategoriesTab />;
      case 'Alerts':
        return <AlertsTab onViewProduct={(id) => push({ type: 'productDetail', productId: id })} />;
      default:
        return null;
    }
  };

  const showBack = screenStack.length > 0 || tab !== 'Catalogue';
  const showingCatalogue = tab === 'Catalogue' && screenStack.length === 0;

  return (
    <main className="min-h-screen pb-16 flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <ProductHeader
        title={getHeaderTitle(tab, topScreen)}
        showBack={showBack}
        onBack={handleBack}
        onAddClick={() => push({ type: 'addProduct' })}
      />

      {/* ── Tab Bar — Hidden when subscreen is active (Mobile Match) ─────── */}
      {screenStack.length === 0 && (
        <div className="mb-4 border-b border-gray-100">
          <div className="flex gap-4 overflow-x-auto pb-0">
            {TABS.map((t) => (
              <div key={t} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => switchTab(t)}
                  className={cn(
                    'py-2 px-1 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap',
                    tab === t ? 'text-[#0A0D14]' : 'text-text-subtle hover:text-[#0A0D14]'
                  )}
                >
                  {t}
                </button>
                <div
                  className={cn(
                    'h-[2px] w-full transition-colors mt-0.5',
                    tab === t ? 'bg-brand' : 'bg-transparent'
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Content View ────────────────────────────────────────────────── */}
      <div className="flex-1">
        {renderContent()}
      </div>
    </main>
  );
}
