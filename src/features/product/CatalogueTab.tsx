'use client';

import { useState } from 'react';
import { ProductDetail } from '@/src/features/product/ProductDetails';
import { EditProductForm } from '@/src/features/product/EditProductForm';
import { StatCard01 } from '@/src/components/ui/StatCard01';
import { MoneyIcon, PakageIcon, WareHouseIcon } from '@/src/assets/icon';
import { SearchIcon } from 'lucide-react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';

// TODO: replace with real API call
const products = [
  {
    id: '1',
    name: 'Rice (50kg bag)',
    sku: 'RC-50KG',
    category: 'Grains',
    price: '₦65,000',
    stock: 42,
  },
  {
    id: '2',
    name: 'Cooking oil (5L)',
    sku: 'CO-5L',
    category: 'Oils',
    price: '₦8,500',
    stock: 18,
  },
  {
    id: '3',
    name: 'Sugar (1kg)',
    sku: 'SG-1KG',
    category: 'Pantry',
    price: '₦1,200',
    stock: 5,
  },
];

type View =
  | { type: 'list' }
  | { type: 'detail'; productId: string }
  | { type: 'edit'; productId: string };

interface CatalogueTabProps {
  onHeaderChange: (
    override: { title: string; onBack: () => void } | null
  ) => void;
  onAddProduct: () => void;
}

export function CatalogueTab({
  onHeaderChange,
  onAddProduct,
}: CatalogueTabProps) {
  const [stock, setStock] = useState('all');

  const [view, setView] = useState<View>({ type: 'list' });

  const goToDetail = (productId: string) => {
    setView({ type: 'detail', productId });
    onHeaderChange({ title: 'Product details', onBack: goToList });
  };

  const goToEdit = (productId: string) => {
    setView({ type: 'edit', productId });
    onHeaderChange({
      title: 'Edit product',
      onBack: () => goToDetail(productId),
    });
  };

  const goToList = () => {
    setView({ type: 'list' });
    onHeaderChange(null);
  };

  if (view.type === 'detail') {
    const product = products.find((p) => p.id === view.productId);
    if (!product) return null;
    return (
      <ProductDetail product={product} onEdit={() => goToEdit(product.id)} />
    );
  }

  if (view.type === 'edit') {
    const product = products.find((p) => p.id === view.productId);
    if (!product) return null;
    return (
      <EditProductForm
        product={product}
        onSaved={() => goToDetail(product.id)}
      />
    );
  }

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="space-y-6 pb-16">
      <div className="grid grid-cols-2 gap-4">
        <StatCard01
          value={`${products.length}`}
          label="Total"
          icon={<PakageIcon width={24} />}
        />

        <StatCard01
          value={`${totalStock}`}
          label="Low Stock"
          icon={<MoneyIcon width={24} />}
        />

        <StatCard01
          value={`${products.length}`}
          label="Out of stock"
          icon={<WareHouseIcon className="text-[#BB5902]" />}
          iconBgClassName="bg-[#FFFDEA]"
        />
      </div>

      <div className="px-2 h-[50px] bg-bg-surface text-[#525866] rounded-full text-sm font-normal flex items-center gap-4 my-6">
        <SearchIcon size={20} />
        <input
          type="text"
          placeholder="Search catalogue..."
          className="flex-1 flex h-full outline-0"
        />
      </div>

      <div>
        <SegmentedTabs
          options={[
            { value: 'all', label: 'All' },
            { value: 'lowStock', label: 'Low Stock' },
            { value: 'outOfStock', label: 'Out of Stock' },
          ]}
          value={stock}
          onChange={setStock}
        />
      </div>

      <div>
        <p className="text-black text-sm font-medium mb-2">Products</p>

        <div className="py-3 px-4 bg-bg-surface rounded-[8px] text-brand">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex justify-between items-center border-b border-[#9B9EA34D] py-2 last:border-0"
              onClick={() => goToDetail(product.id)}
            >
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                  <PakageIcon width={24} />
                </div>
                <div className="gap-1 flex flex-col">
                  <p className="text-text-default font-semibold text-xs">
                    {product.name}
                  </p>
                  <p className="text-text-muted font-medium text-[10px]">
                    SKU-0041 · {product.category}{' '}
                  </p>
                </div>
              </div>
              <div className="flex justify-between flex-col gap-3 items-end">
                <p className="text-text-default text-xs font-semibold">
                  {product.price}
                </p>
                <p className="font-medium text-xs text-text-helper">
                  {product.stock} units
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
