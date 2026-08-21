'use client';

import { useEffect, useState } from 'react';
import { PakageIcon } from '@/src/assets/icon';
import { Eye } from 'lucide-react';
import { reportsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

type AlertFilter = 'all' | 'low-stock' | 'out-of-stock';

interface AlertsTabProps {
  onViewProduct: (productId: string) => void;
}

export function AlertsTab({ onViewProduct }: AlertsTabProps) {
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi.inventory()
      .then((res: any) => {
        const products = res.data?.products ?? [];
        setLowStockItems(products.filter((p: any) => p.belowThreshold));
      })
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.status === 402)) {
          toast.error(err instanceof ApiError ? err.description : 'Failed to load alerts');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const displayed = filter === 'out-of-stock'
    ? lowStockItems.filter((p) => p.totalQuantity === 0)
    : filter === 'low-stock'
    ? lowStockItems.filter((p) => p.totalQuantity > 0)
    : lowStockItems;

  return (
    <div className="space-y-4 pb-12">
      <div className="flex gap-2">
        {([
          { value: 'all', label: 'All' },
          { value: 'low-stock', label: 'Low stock' },
          { value: 'out-of-stock', label: 'Out of stock' },
        ] as { value: AlertFilter; label: string }[]).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              filter === opt.value
                ? 'bg-brand text-white'
                : 'bg-transparent border border-gray-200 text-text-subtle hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-center py-8 text-text-muted text-sm">Loading alerts…</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-8 text-text-muted text-sm">No stock alerts found</div>
      ) : displayed.map((item, idx) => {
        const pct = item.lowStockThreshold > 0 ? Math.min((item.totalQuantity / item.lowStockThreshold) * 100, 100) : 0;
        return (
          <div key={item.productId ?? idx} className="rounded-[12px] px-3 py-2.5 bg-bg-surface flex flex-col gap-4">
            <div className="flex gap-2 items-center">
              <PakageIcon width={24} />
              <div>
                <p className="text-text-subtle font-semibold text-sm">{item.productName}</p>
                <p className="text-text-muted text-xs font-medium">{item.sku}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="mt-2 h-2 flex-1 overflow-hidden rounded-full bg-[#F3F4F5]">
                <div className="h-full rounded-full bg-[#BB5902]" style={{ width: `${pct}%` }} />
              </div>
              <div className="text-[#6D7075] text-xs font-medium whitespace-nowrap">{item.totalQuantity}/{item.lowStockThreshold} units</div>
            </div>
            <button onClick={() => onViewProduct(item.productId)} className="text-[#BB5902] text-xs font-medium bg-amber-lighter w-full py-1 flex rounded-[8px] justify-center items-center gap-1">
              <Eye size={16} /><p>View</p>
            </button>
          </div>
        );
      })}
    </div>
  );
}
