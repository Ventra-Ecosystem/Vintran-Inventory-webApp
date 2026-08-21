'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { NegotiateView } from './NegotiateView';
import { PakageIcon } from '@/src/assets/icon';
import { b2bApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import type { Supplier, Product, HeaderOverride } from './types';
import { toArr } from '@/src/lib/utils';

interface SupplierProductsProps {
  supplier: Supplier;
  onHeaderChange: (o: HeaderOverride) => void;
  onBack: () => void;
}

type SubView = { type: 'list' } | { type: 'negotiate'; product: Product };

export function SupplierProducts({ supplier, onHeaderChange, onBack }: SupplierProductsProps) {
  const [subView, setSubView] = useState<SubView>({ type: 'list' });
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load B2B listings for this supplier's business
    b2bApi.getBusinessListings(supplier.id)
      .then((res: any) => {
        const items: any[] = toArr(res.data);
        setProducts(items.map((l: any) => ({
          id: l.id,
          name: l.productName ?? l.product ?? '—',
          price: `₦${(l.unitPrice ?? 0).toLocaleString()}`,
          stock: l.quantityAvailable ?? 0,
          category: l.category ?? '',
          negotiable: l.isNegotiable ?? false,
        })));
      })
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.status === 403)) {
          toast.error('Failed to load products');
        }
      })
      .finally(() => setLoading(false));
  }, [supplier.id]);

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalProducts = Object.values(cart).filter((q) => q > 0).length;

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));
  };

  const goToNegotiate = (product: Product) => {
    setSubView({ type: 'negotiate', product });
    onHeaderChange({
      title: 'Negotiate price',
      onBack: () => {
        setSubView({ type: 'list' });
        onHeaderChange({ title: supplier.name, onBack });
      },
    });
  };

  if (subView.type === 'negotiate') {
    return <NegotiateView product={subView.product} onCancel={() => setSubView({ type: 'list' })} supplier={supplier} />;
  }

  return (
    <div className="space-y-4">
      {totalItems > 0 && (
        <p className="text-xs font-semibold text-brand">{totalItems} items added</p>
      )}

      {loading ? (
        <p className="text-sm text-text-muted text-center py-8">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">No listings available from this supplier</p>
      ) : (
        <div className="bg-bg-surface rounded-[8px]">
          {products.map((product) => {
            const qty = cart[product.id] ?? 0;
            return (
              <div key={product.id} className="flex justify-between items-center border-b border-[#9B9EA34D] py-3 px-4 last:border-0">
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                    <PakageIcon width={24} />
                  </div>
                  <div>
                    <p className="text-text-default font-semibold text-xs">{product.name}</p>
                    <p className="text-text-muted font-medium text-[10px]">{product.category}</p>
                    <p className="text-text-default font-semibold text-xs mt-0.5">{product.price}</p>
                    {product.negotiable && (
                      <button
                        type="button"
                        onClick={() => goToNegotiate(product)}
                        className="mt-0.5 text-[10px] font-semibold text-brand bg-primary-alpha-10 px-1.5 py-0.5 rounded-full"
                      >
                        Negotiate
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(product.id, -1)} className="h-7 w-7 rounded-full bg-bg-surface flex items-center justify-center">
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-semibold w-5 text-center">{qty}</span>
                  <button onClick={() => updateQty(product.id, 1)} className="h-7 w-7 rounded-full bg-brand text-white flex items-center justify-center">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalItems > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 bg-white px-4 pb-6 pt-3 border-t border-neutral-100">
          <Button variant="secondary" fullWidth size="lg" type="button" onClick={() => setCart({})}>Cancel</Button>
          <Button variant="primary" fullWidth size="lg" type="button">
            Submit order for {totalProducts} product{totalProducts > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}
