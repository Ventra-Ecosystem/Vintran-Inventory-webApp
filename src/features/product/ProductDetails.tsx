'use client';

import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { DeleteIcon, PakageIcon } from '@/src/assets/icon';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: number;
}

interface ProductDetailProps {
  product: Product;
  onEdit: () => void;
}

export function ProductDetail({ product, onEdit }: ProductDetailProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-bg-surface rounded-[8px] px-4 py-3 flex justify-between items-center">
        <div className="flex gap-2">
          <div className="text-brand w-10 h-10 flex justify-center items-center bg-brand-lighter rounded-full">
            <PakageIcon width={24} />
          </div>
          <div>
            <p className="text-text-default font-semibold text-base">
              {product.name}
            </p>
            <p className="text-text-muted text-xs font-medium">
              {product.category}
            </p>
          </div>
        </div>
        <div>
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Product options"
          >
            <MoreVertical size={18} className="text-text-default" />
          </button>
        </div>
      </div>

      <div className="rounded-xl p-4  bg-bg-surface">
        <p className="text-text-subtle text-sm font-semibold mb-2">
          Product details
        </p>
        <div className="flex justify-between border-b border-b-[#9B9EA34D] text-sm py-3 last:border-0">
          <span className="text-text-default font-medium text-xs">
            Category
          </span>
          <span className="text-text-subtle font-semibold text-xs">
            {product.category}
          </span>
        </div>
        <div className="flex justify-between border-b border-b-[#9B9EA34D] text-sm py-3 last:border-0">
          <span className="text-text-default font-medium text-xs">
            Cost per unit
          </span>
          <span className="text-text-subtle font-semibold text-xs">
            {product.price}
          </span>
        </div>
        <div className="flex justify-between border-b border-b-[#9B9EA34D] text-sm py-3 last:border-0">
          <span className="text-text-default font-medium text-xs">Stock </span>
          <span className="text-text-subtle font-semibold text-xs">
            {product.stock}
          </span>
        </div>
      </div>

      <Modal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              onEdit();
            }}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-neutral-900 hover:bg-bg-surface focus:bg-[bg-bg-bg-surface] flex gap-2 items-center"
          >
            <PakageIcon width={24} />
            Edit product details
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-error-dark hover:bg-[#FEF3F2] focus:bg-[#FEF3F2] flex gap-2 items-center"
          >
            <DeleteIcon />
            Delete product
          </button>
        </div>
      </Modal>
    </div>
  );
}
