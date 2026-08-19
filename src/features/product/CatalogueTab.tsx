'use client';

import { useEffect, useState } from 'react';
import { ProductDetail } from '@/src/features/product/ProductDetails';
import { EditProductForm } from '@/src/features/product/EditProductForm';
import { StatCard01 } from '@/src/components/ui/StatCard01';
import { MoneyIcon, PakageIcon, WareHouseIcon } from '@/src/assets/icon';
import { SearchIcon } from 'lucide-react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { productsApi, reportsApi } from '@/src/lib/api/catalog';
import { toast } from 'sonner';
import { ApiError } from '@/src/lib/api/client';

type View =
  | { type: 'list' }
  | { type: 'detail'; productId: string }
  | { type: 'edit'; productId: string };

interface CatalogueTabProps {
  onHeaderChange: (override: { title: string; onBack: () => void } | null) => void;
  onAddProduct: () => void;
}

export function CatalogueTab({ onHeaderChange, onAddProduct }: CatalogueTabProps) {
  const [stock, setStock] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>({ type: 'list' });
  const [products, setProducts] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productsApi.list({ search }),
      reportsApi.inventory(),
    ]).then(([prodRes, repRes]) => {
      setProducts((prodRes as any).data?.items ?? []);
      setReport((repRes as any).data ?? null);
    }).catch((err) => {
      toast.error(err instanceof ApiError ? err.description : 'Failed to load products');
    }).finally(() => setLoading(false));
  }, [search]);

  const goToDetail = (productId: string) => {
    setView({ type: 'detail', productId });
    onHeaderChange({ title: 'Product details', onBack: goToList });
  };
  const goToEdit = (productId: string) => {
    setView({ type: 'edit', productId });
    onHeaderChange({ title: 'Edit product', onBack: () => goToDetail(productId) });
  };
  const goToList = () => { setView({ type: 'list' }); onHeaderChange(null); };

  if (view.type === 'detail') {
    const product = products.find((p) => p.id === view.productId);
    if (!product) return null;
    return <ProductDetail product={product} onEdit={() => goToEdit(product.id)} />;
  }
  if (view.type === 'edit') {
    const product = products.find((p) => p.id === view.productId);
    if (!product) return null;
    return <EditProductForm product={product} onSaved={() => goToDetail(product.id)} />;
  }

  const lowStockCount = report?.lowStockProductCount ?? 0;

  return (
    <div className="space-y-6 pb-16">
      <div className="grid grid-cols-2 gap-4">
        <StatCard01 value={String(products.length)} label="Total" icon={<PakageIcon width={24} />} />
        <StatCard01 value={String(lowStockCount)} label="Low Stock" icon={<MoneyIcon width={24} />} />
        <StatCard01 value="—" label="Out of stock" icon={<WareHouseIcon className="text-[#BB5902]" />} iconBgClassName="bg-[#FFFDEA]" />
      </div>

      <div className="px-2 h-[50px] bg-bg-surface text-[#525866] rounded-full text-sm font-normal flex items-center gap-4 my-6">
        <SearchIcon size={20} />
        <input type="text" placeholder="Search catalogue..." className="flex-1 flex h-full outline-0" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <SegmentedTabs options={[{ value: 'all', label: 'All' }, { value: 'lowStock', label: 'Low Stock' }, { value: 'outOfStock', label: 'Out of Stock' }]} value={stock} onChange={setStock} />

      <div>
        <p className="text-black text-sm font-medium mb-2">Products</p>
        {loading ? (
          <div className="text-center py-8 text-text-muted text-sm">Loading…</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">No products found</div>
        ) : (
          <div className="py-3 px-4 bg-bg-surface rounded-[8px] text-brand">
            {products.map((product) => (
              <div key={product.id} className="flex justify-between items-center border-b border-[#9B9EA34D] py-2 last:border-0 cursor-pointer" onClick={() => goToDetail(product.id)}>
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter"><PakageIcon width={24} /></div>
                  <div className="gap-1 flex flex-col">
                    <p className="text-text-default font-semibold text-xs">{product.name}</p>
                    <p className="text-text-muted font-medium text-[10px]">{product.sku}{product.category ? ` · ${product.category}` : ''}</p>
                  </div>
                </div>
                <div className="flex justify-between flex-col gap-3 items-end">
                  <p className="text-text-default text-xs font-semibold">{product.costPrice != null ? `₦${product.costPrice.toLocaleString()}` : '—'}</p>
                  <p className="font-medium text-xs text-text-helper">{product.unitOfMeasure}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
