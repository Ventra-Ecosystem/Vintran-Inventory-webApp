'use client';

import { useEffect, useState } from 'react';
import { SearchIcon, AlertCircle, Plus } from 'lucide-react';
import { PakageIcon } from '@/src/assets/icon';
import { productsApi, reportsApi } from '@/src/lib/api/catalog';
import { toast } from 'sonner';
import { ApiError } from '@/src/lib/api/client';

interface CatalogueTabProps {
  onProductPress: (productId: string) => void;
  onAddProduct: () => void;
  onViewAll?: () => void;
}

function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
  if (qty === 0) {
    return (
      <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
        Out of stock
      </span>
    );
  }
  if (threshold > 0 && qty <= threshold) {
    return (
      <span className="bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
        Low
      </span>
    );
  }
  return (
    <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
      In stock
    </span>
  );
}

export function CatalogueTab({ onProductPress, onAddProduct, onViewAll }: CatalogueTabProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [products, setProducts] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({ search })
      .then((res: any) => {
        setProducts(res.data?.items ?? (Array.isArray(res.data) ? res.data : []));
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.description : 'Failed to load products');
      })
      .finally(() => setLoading(false));

    reportsApi
      .inventory()
      .then((res: any) => setReport(res.data ?? null))
      .catch(() => {});
  }, [search]);

  const totalCount = products.length;
  const lowStockCount = report?.lowStockProductCount ?? products.filter(p => (p.stock ?? 0) <= (p.lowStockThreshold ?? 0) && (p.stock ?? 0) > 0).length;
  const outOfStockCount = report?.outOfStockProductCount ?? products.filter(p => (p.stock ?? 0) === 0).length;

  const reportMap = new Map((report?.products ?? []).map((p: any) => [p.productId, p]));

  const filteredProducts = products.filter((p) => {
    const r = reportMap.get(p.id) as any;
    const qty = r?.totalQuantity ?? p.stock ?? 0;
    const threshold = r?.lowStockThreshold ?? p.lowStockThreshold ?? 0;

    if (filter === 'Low stock') {
      return qty <= threshold && qty > 0;
    }
    if (filter === 'Out of stock') {
      return qty === 0;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-16">
      {/* ── Stats Grid (Mobile Match) ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-brand-lighter flex items-center justify-center mb-2">
            <PakageIcon width={20} className="text-brand" />
          </div>
          <p className="text-2xl font-bold text-[#0A0D14] mb-0.5">{totalCount}</p>
          <p className="text-xs font-normal text-text-subtle">Total</p>
        </div>

        {/* Low Stock */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <AlertCircle size={18} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-[#0A0D14] mb-0.5">{lowStockCount} Items</p>
          <p className="text-xs font-normal text-text-subtle">Low Stock</p>
        </div>

        {/* Out of stock */}
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
          <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center mb-2">
            <span className="text-xs font-bold text-red-500">!</span>
          </div>
          <p className="text-2xl font-bold text-[#0A0D14] mb-0.5">{outOfStockCount}</p>
          <p className="text-xs font-normal text-text-subtle">Out of stock</p>
        </div>

        {/* Add Product CTA Card */}
        <button
          type="button"
          onClick={onAddProduct}
          className="bg-brand-lighter rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors border border-blue-100"
        >
          <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center mb-1">
            <Plus size={18} />
          </div>
          <span className="text-xs font-semibold text-brand">Add Product</span>
        </button>
      </div>

      {/* ── Search Input ────────────────────────────────────────────────── */}
      <div className="px-4 h-[46px] bg-[#F8FAFC] rounded-xl text-[#525866] text-sm flex items-center gap-3 border border-gray-100">
        <SearchIcon size={18} className="text-text-muted shrink-0" />
        <input
          type="text"
          placeholder="Search products SKU or category"
          className="flex-1 h-full outline-none bg-transparent text-[#0A0D14] placeholder:text-text-muted"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Filter Pills ────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {['All', 'Low stock', 'Out of stock'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              filter === f
                ? 'bg-brand text-white'
                : 'bg-transparent border border-gray-200 text-text-subtle hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Products Header ────────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <p className="text-sm font-bold text-[#0A0D14]">Products</p>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-brand cursor-pointer hover:underline"
          >
            View all
          </button>
        )}
      </div>

      {/* ── Products Card List ────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-10 text-text-muted text-sm font-medium">Loading products…</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-text-muted text-sm font-medium">No products found</div>
      ) : (
        <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-gray-100">
          {filteredProducts.map((p, i) => {
            const r = reportMap.get(p.id) as any;
            const qty = r?.totalQuantity ?? p.stock ?? 0;
            const threshold = r?.lowStockThreshold ?? p.lowStockThreshold ?? 0;

            return (
              <div
                key={p.id}
                onClick={() => onProductPress(p.id)}
                className={`flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-100/60 transition-colors ${
                  i < filteredProducts.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-lighter flex items-center justify-center shrink-0">
                    <PakageIcon width={20} className="text-brand" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0A0D14] truncate">{p.name}</p>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {p.sku ? p.sku : 'No SKU'}
                      {p.category ? ` · ${p.category}` : ''}
                      {p.subcategory ? ` / ${p.subcategory}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-xs font-bold text-[#0A0D14]">
                    {p.costPrice != null ? `₦${Number(p.costPrice).toLocaleString()}` : '—'}
                  </p>
                  <StockBadge qty={qty} threshold={threshold} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
