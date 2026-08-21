'use client';

import { useEffect, useState } from 'react';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { PakageIcon, WareHouseIcon } from '@/src/assets/icon';
import { productsApi, locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';

type HistoryFilter = 'all' | 'received' | 'transferred' | 'adjustments';

export function HistoryTab() {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load products then fetch movements for each
    productsApi.list({ pageSize: 20 })
      .then(async (res: any) => {
        const items = toArr(res.data);
        setProducts(items);
        // Aggregate movements from first few products
        const allMovements: any[] = [];
        await Promise.allSettled(
          items.slice(0, 5).map((p: any) =>
            productsApi.getMovements(p.id, { limit: 10 }).then((r: any) => {
              const mvs = r.data ?? [];
              mvs.forEach((m: any) => {
                allMovements.push({ ...m, productName: p.name, productSku: p.sku });
              });
            }).catch(() => {})
          )
        );
        // Sort by date desc
        allMovements.sort((a, b) => new Date(b.occurredOnUtc ?? b.createdOnUtc ?? 0).getTime() - new Date(a.occurredOnUtc ?? a.createdOnUtc ?? 0).getTime());
        setMovements(allMovements);
      })
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.status === 403)) {
          toast.error('Failed to load history');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function mapMovementType(type: string): HistoryFilter {
    const t = (type ?? '').toLowerCase();
    if (t.includes('receive') || t.includes('receipt')) return 'received';
    if (t.includes('transfer')) return 'transferred';
    if (t.includes('adjust') || t.includes('spoilage') || t.includes('return')) return 'adjustments';
    return 'all';
  }

  const filtered = filter === 'all'
    ? movements
    : movements.filter((m) => mapMovementType(m.movementType ?? m.type) === filter);

  return (
    <div className="space-y-4">
      <SegmentedTabs
        options={[
          { value: 'all', label: 'All' },
          { value: 'received', label: 'Received' },
          { value: 'transferred', label: 'Transferred' },
          { value: 'adjustments', label: 'Adjustments' },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {loading ? (
        <div className="text-center py-8 text-text-muted text-sm">Loading history…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-text-muted text-sm">No history found</div>
      ) : (
        <div className="py-3 px-4 bg-bg-surface rounded-[8px]">
          {filtered.map((item: any, idx: number) => (
            <div
              key={item.id ?? idx}
              className="flex justify-between items-center border-b border-[#9B9EA34D] py-2 last:border-0"
            >
              <div className="flex gap-2 items-center">
                <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
                  <WareHouseIcon />
                </div>
                <div className="gap-1 flex flex-col">
                  <p className="text-text-default font-semibold text-xs">
                    {item.productName ?? item.product ?? '—'}
                  </p>
                  <p className="text-text-muted font-medium text-[10px]">
                    {item.locationName ?? '—'}
                  </p>
                  <p className="text-text-muted font-medium text-[10px]">
                    {item.movementType ?? item.type ?? '—'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between flex-col gap-3 items-end">
                <p className="text-[#007FAB] text-xs font-semibold">
                  {item.quantity ?? item.quantityDelta ?? 0} units
                </p>
                <p className="font-medium text-text-default text-xs">
                  {item.occurredOnUtc
                    ? new Date(item.occurredOnUtc).toLocaleDateString()
                    : item.createdOnUtc
                    ? new Date(item.createdOnUtc).toLocaleDateString()
                    : '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
