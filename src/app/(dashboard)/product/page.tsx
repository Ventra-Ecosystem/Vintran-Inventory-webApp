'use client';

import { useState } from 'react';
import { ProductHeader } from '@/src/components/dashboard/ProductHeader';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { CatalogueTab } from '@/src/features/product/CatalogueTab';
import { AddProductTab } from '@/src/features/product/AddProductTab';
import { BulkUploadTab } from '@/src/features/product/BulkUploadTab';
import { CategoriesTab } from '@/src/features/product/CategoriesTab';
import { AlertsTab } from '@/src/features/product/AlertsTab';
import { cn } from '@/src/lib/utils';

type ProductTab =
  | 'catalogue'
  | 'add-product'
  | 'bulk-upload'
  | 'categories'
  | 'alerts';

const tabOptions: { value: ProductTab; label: string }[] = [
  { value: 'catalogue', label: 'Catalogue' },
  { value: 'add-product', label: 'Add product' },
  { value: 'bulk-upload', label: 'Bulk upload' },
  { value: 'categories', label: 'Categories' },
  { value: 'alerts', label: 'Alerts' },
];

export default function ProductPage() {
  const [activeTab, setActiveTab] = useState<ProductTab>('catalogue');
  // Drives header title + back-button behavior for sub-views inside a tab (e.g. product detail, edit form)
  const [headerOverride, setHeaderOverride] = useState<{
    title: string;
    onBack: () => void;
  } | null>(null);

  const goToCatalogueRoot = () => {
    setHeaderOverride(null);
    setActiveTab('catalogue');
  };

  const handleBack = () => {
    if (headerOverride) {
      headerOverride.onBack();
    } else {
      setActiveTab('catalogue');
    }
  };

  const showBack = activeTab !== 'catalogue' || !!headerOverride;
  const title =
    headerOverride?.title ??
    (activeTab === 'catalogue'
      ? 'Product'
      : (tabOptions.find((t) => t.value === activeTab)?.label ?? 'Product'));

  return (
    <main className="h-full mb-16 flex flex-col">
      <ProductHeader
        title={title}
        showBack={showBack}
        onBack={handleBack}
        onAddClick={() => setActiveTab('add-product')}
      />

      {!headerOverride && (
        <div className="mb-3">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tabOptions.map((opt) => (
              <div key={opt.value} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab(opt.value)}
                  className={cn(
                    'flex-1 whitespace-nowrap rounded-lg text-sm font-medium transition-colors',
                    activeTab === opt.value
                      ? 'text-text-default'
                      : 'text-text-helper'
                  )}
                >
                  {opt.label}
                </button>

                <div
                  className={cn(
                    'h-[2px] w-8 transition-colors mt-0.5',
                    activeTab === opt.value ? 'bg-brand' : 'bg-transparent'
                  )}
                ></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-full flex flex-col">
        {activeTab === 'catalogue' && (
          <CatalogueTab
            onHeaderChange={setHeaderOverride}
            onAddProduct={() => setActiveTab('add-product')}
          />
        )}
        {activeTab === 'add-product' && (
          <AddProductTab onDone={goToCatalogueRoot} />
        )}
        {activeTab === 'bulk-upload' && <BulkUploadTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'alerts' && <AlertsTab onViewProduct={() => {}} />}
      </div>
    </main>
  );
}
