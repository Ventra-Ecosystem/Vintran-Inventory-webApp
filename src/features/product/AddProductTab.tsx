'use client';

import { useEffect, useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { PakageIcon } from '@/src/assets/icon';
import { productsApi, categoriesApi } from '@/src/lib/api/catalog';
import { toArr } from '@/src/lib/utils';

interface AddProductTabProps {
  onAddNew: () => void;
  onGoToCategories?: () => void;
}

export function AddProductTab({ onAddNew, onGoToCategories }: AddProductTabProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoriesApi.list(),
      productsApi.list({ pageSize: 6 }),
    ])
      .then(([catRes, prodRes]: [any, any]) => {
        setCategories(toArr(catRes.data));
        setRecentProducts(toArr(prodRes.data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hasCategories = categories.length > 0;

  return (
    <div className="space-y-6 pb-16">
      {/* ── No-Category Warning Banner ─────────────────────────────────── */}
      {!loading && !hasCategories && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={18} className="text-amber-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900 mb-1">No categories found</p>
            <p className="text-xs text-amber-800 leading-relaxed mb-3">
              You need to create at least one category before adding a product.
            </p>
            <button
              type="button"
              onClick={onGoToCategories}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1"
            >
              Go to Categories →
            </button>
          </div>
        </div>
      )}

      {/* ── Big "Add Product" CTA Button ─────────────────────────────────── */}
      <button
        type="button"
        onClick={hasCategories ? onAddNew : onGoToCategories}
        className={`w-full h-13 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
          hasCategories ? 'bg-brand hover:bg-blue-700 shadow-blue-500/20' : 'bg-gray-400 hover:bg-gray-500 shadow-gray-400/20'
        }`}
      >
        <Plus size={20} />
        <span>Add Product</span>
      </button>

      {/* ── Recently Added Section ─────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-10 text-text-muted text-sm font-medium">Loading recent products…</div>
      ) : recentProducts.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#0A0D14]">Recently Added</p>
            <span className="text-xs font-medium text-text-muted">Today</span>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-gray-100">
            {recentProducts.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  i < recentProducts.length - 1 ? 'border-b border-gray-100' : ''
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
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-[#0A0D14]">
                    {p.costPrice != null ? `₦${Number(p.costPrice).toLocaleString()}` : '—'}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">{p.unitOfMeasure ?? 'unit'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-lighter flex items-center justify-center mb-4">
            <PakageIcon width={32} className="text-brand" />
          </div>
          <p className="text-base font-bold text-[#0A0D14] mb-1">No products yet</p>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            Click "Add Product" above to add your first product to the catalogue.
          </p>
        </div>
      )}
    </div>
  );
}
