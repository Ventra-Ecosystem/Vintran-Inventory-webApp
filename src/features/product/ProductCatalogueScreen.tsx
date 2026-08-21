'use client';

import { useEffect, useState } from 'react';
import { SearchIcon } from 'lucide-react';
import { PakageIcon } from '@/src/assets/icon';
import { productsApi } from '@/src/lib/api/catalog';

interface ProductCatalogueScreenProps {
  onProductPress: (id: string) => void;
}

export function ProductCatalogueScreen({ onProductPress }: ProductCatalogueScreenProps) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({ search, pageSize: 100 })
      .then((res: any) => {
        setProducts(res.data?.items ?? (Array.isArray(res.data) ? res.data : []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-4 pb-16">
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

      <div>
        <p className="text-sm font-bold text-[#0A0D14] mb-3">Full Product Catalogue ({products.length})</p>
        {loading ? (
          <div className="text-center py-10 text-text-muted text-sm font-medium">Loading catalogue…</div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-text-muted text-sm font-medium">No products found</div>
        ) : (
          <div className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-gray-100 divide-y divide-gray-100">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => onProductPress(p.id)}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-100/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-lighter flex items-center justify-center shrink-0">
                    <PakageIcon width={20} className="text-brand" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0A0D14] truncate">{p.name}</p>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {p.sku ?? 'No SKU'}{p.category ? ` · ${p.category}` : ''}
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
        )}
      </div>
    </div>
  );
}
